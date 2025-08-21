import React, { memo, useMemo } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Stop, Circle } from "react-native-svg";
import { Cue } from "../assets/data/mock";

interface VerticalDashedTimelineProps {
  totalDuration: number; // Total duration in seconds
  dashCount?: number; // Number of dashes in the timeline
  dashWidth?: number; // Width of each dash
  dashGap?: number; // Gap between dashes
  lineWidth?: number; // Width of the timeline line
  backgroundColor?: string;
  gradientColors?: string[]; // Colors for gradient
  cues?: Cue[]; // Cues for coloring segments
  onCueSelect?: (cue: Cue) => void;
  onCueAdd?: (timePosition: number) => void;
}

const VerticalDashedTimeline = memo(function VerticalDashedTimeline({
  totalDuration,
  dashCount = 60, // Default to 60 dashes (e.g., one per second for a 1-minute session)
  dashWidth = 3,
  dashGap = 2,
  lineWidth = 2,
  backgroundColor = "rgba(255,255,255,0.2)",
  gradientColors = ["#8A2BE2", "#4169E1"], // Purple to blue gradient
  cues = [],
  onCueSelect,
  onCueAdd,
}: VerticalDashedTimelineProps) {
  // Calculate dimensions
  const timelineHeight = (dashWidth + dashGap) * dashCount;
  const timelineWidth = lineWidth;
  
  // Calculate time per dash
  const timePerDash = totalDuration / dashCount;
  
  // Create dash segments with colors based on cues
  const dashSegments = useMemo(() => {
    const segments = [];
    const useCues = cues && cues.length > 0;
    
    for (let i = 0; i < dashCount; i++) {
      let segmentColor = backgroundColor;
      let hasCue = false;
      let cueType: "trigger" | "segment" | null = null;
      let cueId: string | null = null;
      
      // Calculate time position for this dash
      const dashTimeStart = i * timePerDash;
      const dashTimeEnd = (i + 1) * timePerDash;
      const dashTimeMid = (dashTimeStart + dashTimeEnd) / 2;
      
      // If we have cues, determine the color based on which cue this segment falls into
      if (useCues) {
        for (const cue of cues) {
          // For trigger cues, check if this segment is at the trigger point
          if (cue.type === 'trigger') {
            const triggerTimePosition = cue.startTime;
            
            // Only color the dash if it's exactly at the trigger point
            if (dashTimeStart <= triggerTimePosition && triggerTimePosition < dashTimeEnd) {
              segmentColor = cue.color;
              hasCue = true;
              cueType = "trigger";
              cueId = cue.id;
              break;
            }
          } 
          // For segment cues, check if this segment is within the segment duration
          else if (cue.type === 'segment') {
            const cueStartTime = cue.startTime;
            const cueEndTime = cueStartTime + cue.duration;
            
            // Color the dash if it's within the segment
            if (dashTimeMid >= cueStartTime && dashTimeMid < cueEndTime) {
              segmentColor = cue.color;
              hasCue = true;
              cueType = "segment";
              cueId = cue.id;
              break;
            }
          }
        }
      }
      
      segments.push({
        id: i,
        color: segmentColor,
        position: i * (dashWidth + dashGap),
        timePosition: dashTimeMid,
        hasCue,
        cueType,
        cueId
      });
    }
    
    return segments;
  }, [dashCount, cues, backgroundColor, timePerDash]);

  // Handle tap on a dash
  const handleDashPress = (segment: any) => {
    console.log('Timeline dash pressed:', segment);
    
    if (segment.hasCue && segment.cueId && onCueSelect) {
      // Find the cue and pass it to the handler
      const cue = cues.find(c => c.id === segment.cueId);
      console.log('Found existing cue:', cue);
      if (cue) {
        console.log('Calling onCueSelect with cue:', cue);
        onCueSelect(cue);
      }
    } else if (onCueAdd) {
      // Add a new cue at this time position
      console.log('Adding new cue at time position:', segment.timePosition);
      onCueAdd(segment.timePosition);
    } else {
      console.log('No handler available for this interaction');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        {/* Time labels on the left */}
        <View style={styles.timeLabelsContainer}>
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const timeValue = Math.floor(totalDuration * fraction);
            const minutes = Math.floor(timeValue / 60);
            const seconds = timeValue % 60;
            const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            return (
              <Text 
                key={`label-${fraction}`} 
                style={[
                  styles.timeLabel, 
                  { top: timelineHeight * fraction - 10 }
                ]}
              >
                {formattedTime}
              </Text>
            );
          })}
        </View>
        
        {/* Timeline SVG */}
        <Svg
          width={timelineWidth + 40} // Extra width for cue indicators
          height={timelineHeight}
          style={styles.timeline}
        >
          <Defs>
            <LinearGradient
              id="timelineGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0%" stopColor={gradientColors[0]} />
              <Stop offset="100%" stopColor={gradientColors[1]} />
            </LinearGradient>
          </Defs>

          {/* Draw individual dash segments */}
          {dashSegments.map((segment) => (
            <G key={segment.id}>
              {/* Main timeline dash */}
              <Line
                x1={20}
                y1={segment.position + dashWidth / 2}
                x2={20 + lineWidth}
                y2={segment.position + dashWidth / 2}
                stroke={segment.color}
                strokeWidth={dashWidth}
                strokeLinecap="round"
              />
              
              {/* Trigger indicator (dot) */}
              {segment.hasCue && segment.cueType === "trigger" && (
                <G>
                  <Line
                    x1={20 + lineWidth}
                    y1={segment.position + dashWidth / 2}
                    x2={35}
                    y2={segment.position + dashWidth / 2}
                    stroke={segment.color}
                    strokeWidth={1}
                  />
                  <Circle
                    cx={35}
                    cy={segment.position + dashWidth / 2}
                    r={4}
                    fill={segment.color}
                  />
                </G>
              )}
            </G>
          ))}
        </Svg>
        
        {/* Interactive overlay for tapping on dashes */}
        <View style={[styles.interactiveOverlay, { height: timelineHeight }]}>
          {dashSegments.map((segment) => (
            <TouchableOpacity
              key={`touch-${segment.id}`}
              style={[
                styles.dashTouchArea,
                { 
                  top: segment.position,
                  height: dashWidth + dashGap
                }
              ]}
              onPress={() => handleDashPress(segment)}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  timelineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  timeline: {
    marginLeft: 50, // Space for time labels
  },
  timeLabelsContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: 50,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  timeLabel: {
    color: "white",
    fontSize: 12,
    position: "absolute",
    right: 5,
  },
  interactiveOverlay: {
    position: "absolute",
    left: 50,
    top: 0,
    width: 40,
    zIndex: 10,
  },
  dashTouchArea: {
    position: "absolute",
    left: 0,
    width: "100%",
  },
});

export default VerticalDashedTimeline;
