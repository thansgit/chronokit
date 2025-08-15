import { memo } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

interface TimerRingProps {
  totalDuration: number; // Total duration in seconds
  currentValue: number; // Current timer value to display
  radius?: number;
  strokeWidth?: number;
  textColor?: string;
  ringColor?: string;
  backgroundColor?: string;
}

// Use React.memo to prevent unnecessary re-renders
const TimerRing = memo(function TimerRing({
  totalDuration,
  currentValue,
  radius = 140,
  strokeWidth = 10,
  textColor = "white",
  ringColor = "green",
  backgroundColor = "lightgreen",
}: TimerRingProps) {
  console.log("TimerRing rendered");

  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;
  // currentValue is remaining seconds; compute elapsed fraction
  const safeTotal = Math.max(1, totalDuration);
  const elapsed = Math.max(0, Math.min(safeTotal, safeTotal - currentValue));
  const strokeDashoffset = (elapsed / safeTotal) * circleCircumference;

  return (
    <View>
      <Svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}
      >
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx={"50%"}
            cy={"50%"}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <Circle
            cx={"50%"}
            cy={"50%"}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <TextInput
        underlineColorAndroid="transparent"
        editable={false}
        value={`${currentValue}`}
        style={[
          StyleSheet.absoluteFillObject,
          {
            color: textColor,
            fontSize: radius / 3,
            fontWeight: "bold",
            textAlign: "center",
          },
        ]}
      />
    </View>
  );
});

export default TimerRing;
