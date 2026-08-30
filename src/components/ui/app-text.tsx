import { Text, type TextProps } from 'react-native';

import {
  colors,
  statusColors,
  textCategories,
  type Status,
  type TextCategory,
} from '@/theme';

// Replacement for UI Kitten <Text>. Same props the legacy app uses:
// category (h1..label), appearance ("hint"), status — resolved to Eva values.

export type AppTextProps = TextProps & {
  category?: TextCategory;
  appearance?: 'default' | 'hint' | 'alternative';
  status?: Status;
};

export function AppText({
  category = 'p1',
  appearance = 'default',
  status,
  style,
  ...rest
}: AppTextProps) {
  const color = status
    ? statusColors[status]
    : appearance === 'hint'
      ? colors.textHint
      : appearance === 'alternative'
        ? colors.textControl
        : colors.textBasic;

  return <Text {...rest} style={[textCategories[category], { color }, style]} />;
}
