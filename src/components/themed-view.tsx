import { View, type ViewProps } from 'react-native';

import { Elevation, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  // "backgroundElement" is this app's card/surface convention everywhere
  // (AyahCard, result cards, stat cards, ...) -- giving it real depth here
  // once elevates every card in the app, instead of adding a shadow style
  // to each screen that uses one.
  const elevation = type === 'backgroundElement' ? Elevation.low : undefined;

  return (
    <View style={[{ backgroundColor: theme[type ?? 'background'] }, elevation, style]} {...otherProps} />
  );
}
