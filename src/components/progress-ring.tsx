import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

interface ProgressRingProps {
  /** 0-1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
}

/** A circular progress ring (Muslim Pro's "N/5 prayed" indicator on its
 * Prayers screen) -- `react-native-svg` is already a dependency elsewhere
 * in the app, so this is a stroke-dashoffset ring rather than a new one. */
export function ProgressRing({ progress, size = 72, strokeWidth = 6, children, style }: ProgressRingProps) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.backgroundSelected} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      {children}
    </View>
  );
}
