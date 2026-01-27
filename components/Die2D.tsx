import { getDotsForNumber } from "@/lib/math";
import Svg, { Circle, Rect } from "react-native-svg";

export interface Die2DProps {
  id: string;
  value: number;
  size: number;
  isHeld?: boolean;
  onHold?: (id: string) => void;
}

export default function Die2D({ id, value, size, isHeld = false, onHold }: Die2DProps) {
  const dots = getDotsForNumber(value);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} onPress={() => onHold?.(id)}>
      <Rect
        key={`rect-${id}-held`}
        x={0}
        y={0}
        width={size}
        height={size}
        fill="yellow"
        opacity={isHeld ? 1 : 0}
      />
      <Rect
        key={`rect-${id}`}
        x={size * 0.05}
        y={size * 0.05}
        width={size - size * 0.1}
        height={size - size * 0.1}
        fill="white"
      />
      {dots.map((dot, index) => (
        <Circle key={`dot-${id}-${index}`} cx={size / 2 - dot[0] * size} cy={size / 2 - dot[1] * size} r={size * 0.1} fill="black" />
      ))}
    </Svg>
  );
}

