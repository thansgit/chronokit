import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Defs, G, Line, LinearGradient, Stop } from "react-native-svg";

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
  gradientColors = ["#8A2BE2", "#4169E1"], // Purple to blue gradient
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

  // Create an array of dash segments with different colors
  const dashSegments = useMemo(() => {
    const segments = [];

    for (let i = 0; i < dashCount; i++) {
      // Determine if this segment should be colored or background
      const isColored = i < coloredSegments;
      const segmentColor = isColored ? ringColor : backgroundColor;

      // Calculate the angle for this segment
      const startAngle = i * segmentAngle; // Start at top (12 o'clock)

      segments.push({
        id: i,
        color: segmentColor,
        angle: startAngle,
      });
    }

    return segments;
  }, [dashCount, coloredSegments, ringColor, backgroundColor, segmentAngle]);

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
      <Text
        style={[
          styles.timerText,
          {
            color: textColor,
            fontSize: radius / 2,
          },
        ]}
      >
        {currentValue}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    position: "absolute",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default TimerRing;
