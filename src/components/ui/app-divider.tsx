import { View, type ViewProps } from 'react-native';

import { colors } from '@/theme';

// Replacement for UI Kitten <Divider>: 1px line, background-basic-color-3.

export function AppDivider({ style, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[{ height: 1, backgroundColor: colors.backgroundLevel3 }, style]}
    />
  );
}
