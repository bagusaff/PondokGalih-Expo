import { View, type ViewProps } from 'react-native';

import { colors } from '@/theme';

// Replacement for UI Kitten <Layout level="1..4">.

export type AppLayoutProps = ViewProps & {
  level?: '1' | '2' | '3' | '4';
};

const levelColors = {
  '1': colors.backgroundLevel1,
  '2': colors.backgroundLevel2,
  '3': colors.backgroundLevel3,
  '4': colors.backgroundLevel4,
} as const;

export function AppLayout({ level = '1', style, ...rest }: AppLayoutProps) {
  return (
    <View {...rest} style={[{ backgroundColor: levelColors[level] }, style]} />
  );
}
