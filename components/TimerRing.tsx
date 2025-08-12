import Svg, { Circle } from "react-native-svg";

export default function TimerRing(props: any) {
  return (
    <Svg height="50%" width="50%" viewBox="0 0 100 100" {...props}>
      <Circle
        cx="50"
        cy="50"
        r="45"
        stroke="blue"
        strokeWidth="2.5"
        fill="green"
      />
    </Svg>
  );
}
