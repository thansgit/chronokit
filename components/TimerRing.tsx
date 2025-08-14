import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedInput = Animated.createAnimatedComponent(TextInput);

interface TimerRingProps {
  percentage?: number;
  radius?: number;
  strokeWidth?: number;
  duration?: number;
  color?: string;
  delay?: number;
  textColor?: string;
  max?: number;
}

export default function TimerRing({
  percentage = 99,
  radius = 80,
  strokeWidth = 20,
  duration = 500,
  color = "red",
  delay = 500,
  textColor = "white",
  max = 100,
}: TimerRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circleRef = useRef<React.ComponentRef<typeof AnimatedCircle>>(null);
  const inputRef = useRef<React.ComponentRef<typeof AnimatedInput>>(null);
  const halfCircle = radius + strokeWidth;
  const circleCircumference = 2 * Math.PI * radius;

  const animation = (toValue: number) => {
    return Animated.timing(animatedValue, {
      toValue,
      duration,
      delay,
      useNativeDriver: true,
    }).start(() => {
      animation(toValue === 0 ? percentage : 0);
    });
  };

  useEffect(() => {
    animation(percentage);

    animatedValue.addListener((v) => {
      if (circleRef?.current) {
        const maxPercentage = (100 * v.value) / max;
        const strokeDashoffset =
          circleCircumference - (circleCircumference * maxPercentage) / 100;
        (circleRef.current as any).setNativeProps({
          strokeDashoffset,
        });
      }
      if (inputRef?.current) {
        (inputRef.current as any).setNativeProps({
          text: `${Math.round(v.value)} / ${max}`,
        });
      }
    });

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [max, percentage]);

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
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeOpacity={0.2}
          />
          <AnimatedCircle
            ref={circleRef}
            cx={"50%"}
            cy={"50%"}
            stroke={color}
            strokeWidth={strokeWidth}
            r={radius}
            fill="transparent"
            strokeDasharray={circleCircumference}
            strokeDashoffset={circleCircumference}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <AnimatedInput
        ref={inputRef}
        underlineColorAndroid="transparent"
        editable={false}
        defaultValue="0"
        style={[
          StyleSheet.absoluteFillObject,
          {
            color: textColor ?? color,
            fontSize: radius / 3,
            fontWeight: "bold",
            textAlign: "center",
          },
        ]}
      />
    </View>
  );
}
