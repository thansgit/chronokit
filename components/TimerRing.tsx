import { memo, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Stop } from "react-native-svg";
import { Cue } from "../assets/data/mock";
import { FormattedTimeDisplay } from "./FormattedTimeDisplay";
import { ResetButton } from "./ResetButton";

interface TimerRingProps {
  totalDuration: number; // Total duration in seconds
  currentValue: number; // Current timer value to display
  radius?: number;
  strokeWidth?: number;
  textColor?: string;
  ringColor?: string;
  backgroundColor?: string;
  dashCount?: number; // Number of dashes in the circle
  dashWidth?: number; // Width of each dash
  gradientColors?: string[]; // Colors for gradient
  cues?: Cue[]; // Optional cues for coloring segments
  onReset?: () => void; // Reset callback function
}

// Use React.memo to prevent unnecessary re-renders
const TimerRing = memo(function TimerRing({
  totalDuration,
  currentValue,
  radius = 160,
  strokeWidth = 8,
  textColor = "white",
  ringColor = "url(#timerGradient)",
  backgroundColor = "rgba(255,255,255,0.2)",
  dashCount = 10,
  dashWidth = 3,
  gradientColors = ["#FFA500", "#FF4433"], // Purple to blue gradient
  cues = [],
  onReset,
}: TimerRingProps) {
  console.log("TimerRing rendered");

  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;

  // Calculate dash array for the dashed circle effect
  const strokeDashArray = useMemo(() => {
    const totalDashSpace = dashWidth * dashCount;
    const dashGap = (circleCircumference - totalDashSpace) / dashCount;
    return `${dashWidth} ${dashGap}`;
  }, [circleCircumference, dashCount, dashWidth]);

  // currentValue is remaining seconds; compute elapsed fraction
  const safeTotal = Math.max(1, totalDuration);
  const elapsed = Math.max(0, Math.min(safeTotal, safeTotal - currentValue));
  const progress = elapsed / safeTotal;

  // Calculate the stroke dash offset for the "eating away" effect
  // We'll create individual dash segments and hide them as the timer progresses
  const segmentAngle = 360 / dashCount;
  const segmentLength = circleCircumference / dashCount;

  // Calculate how many segments should be colored vs background
  const coloredSegments = Math.floor(dashCount * (1 - progress));

  // Create an array of dash segments with different colors based on cues
  const dashSegments = useMemo(() => {
    const segments = [];
    const useCues = cues && cues.length > 0;

    // Calculate the time represented by each segment
    const timePerSegment = totalDuration / dashCount;

    for (let i = 0; i < dashCount; i++) {
      // Determine if this segment should be colored or background
      const isColored = i < coloredSegments;
      let segmentColor = isColored ? ringColor : backgroundColor;

      // If we have cues, determine the color based on which cue this segment falls into
      if (useCues && isColored) {
        // We need to map the segment index to actual time in the timer
        // Since the timer counts down, we need to reverse the index to get time from start
        const timeFromStart = totalDuration - (i + 0.5) * timePerSegment;
        const segmentStartTime = totalDuration - (i + 1) * timePerSegment;
        const segmentEndTime = totalDuration - i * timePerSegment;

        // Find which cue this segment belongs to
        for (const cue of cues!) {
          // For trigger cues, check if this segment is at the trigger point
          if (cue.type === "trigger") {
            const triggerTimePosition = cue.startTime;

            // Only color the dash if it's exactly at the trigger point
            if (
              segmentStartTime <= triggerTimePosition &&
              triggerTimePosition < segmentEndTime
            ) {
              segmentColor = cue.color;
              break;
            }
          }
          // For segment cues, check if this segment is within the segment duration
          else if (cue.type === "segment") {
            const cueStartTime = cue.startTime;
            const cueEndTime = cueStartTime + cue.duration;

            // Color the dash if it's within the segment
            if (timeFromStart >= cueStartTime && timeFromStart < cueEndTime) {
              segmentColor = cue.color;
              break;
            }
          }
        }
      }

      // Calculate the angle for this segment
      const startAngle = i * segmentAngle; // Start at top (12 o'clock)

      segments.push({
        id: i,
        color: segmentColor,
        angle: startAngle,
      });
    }

    return segments;
  }, [
    dashCount,
    coloredSegments,
    ringColor,
    backgroundColor,
    segmentAngle,
    cues,
    totalDuration,
  ]);

  return (
    <View style={styles.container}>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <Defs>
          <LinearGradient
            id="timerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={gradientColors[0]} />
            <Stop offset="100%" stopColor={gradientColors[1]} />
          </LinearGradient>
        </Defs>

        {/* Draw individual dash segments with different colors */}
        {dashSegments.map((segment) => (
          <G
            key={segment.id}
            rotation={segment.angle}
            origin={`${halfCircle}, ${halfCircle}`}
          >
            <Line
              x1={halfCircle}
              y1={halfCircle - radius + strokeWidth / 2}
              x2={halfCircle}
              y2={halfCircle - radius - strokeWidth / 2}
              stroke={segment.color}
              strokeWidth={dashWidth}
              strokeLinecap="round"
            />
          </G>
        ))}
      </Svg>
      <View style={styles.contentContainer}>
        <FormattedTimeDisplay
          seconds={currentValue}
          style={[
            styles.timerText,
            {
              color: textColor,
              fontSize: radius / 2,
            },
          ]}
        />
        {onReset && (
          <View style={styles.resetButtonContainer}>
            <ResetButton onReset={onReset} />
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  timerText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  resetButtonContainer: {
    marginTop: 20,
  },
});

export default TimerRing;
