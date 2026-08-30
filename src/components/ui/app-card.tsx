import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, metrics, palette } from '@/theme';

// Replacement for UI Kitten <Card> (outline appearance): white background,
// 4px radius, 1px basic-400 border; pressed state -> basic-200 background.
// Padding stays with the caller — legacy screens style card bodies themselves.

export type AppCardProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export function AppCard({ style, onPress, ...rest }: AppCardProps) {
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          backgroundColor: pressed && onPress ? palette.basic200 : palette.basic100,
          borderRadius: metrics.borderRadius,
          borderWidth: metrics.borderWidth,
          borderColor: colors.border4,
        },
        style,
      ]}
    />
  );
}
