import { memo } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  progress: Animated.Value; // Animation progress value
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
  progress,
  totalDuration,
  currentValue,
  radius = 80,
  strokeWidth = 20,
  textColor = "white",
  ringColor = "green",
  backgroundColor = "lightgreen",
}: TimerRingProps) {
  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;



  // Map the progress value to strokeDashoffset
  // As progress increases from 0 to totalDuration,
  // strokeDashoffset should increase from 0 to circleCircumference
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, totalDuration],
    outputRange: [0, circleCircumference],
    extrapolate: "clamp",
  });


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
          <AnimatedCircle
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
