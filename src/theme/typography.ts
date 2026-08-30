import type { TextStyle } from 'react-native';

// Eva text categories, values from @eva-design/eva@2.1.1 mapping.json (strict).
// Same categories the old app passes to <Text category="...">.

export type TextCategory =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 's1'
  | 's2'
  | 'p1'
  | 'p2'
  | 'c1'
  | 'c2'
  | 'label';

export const textCategories: Record<TextCategory, TextStyle> = {
  h1: { fontSize: 36, fontWeight: '800' },
  h2: { fontSize: 32, fontWeight: '800' },
  h3: { fontSize: 30, fontWeight: '800' },
  h4: { fontSize: 26, fontWeight: '800' },
  h5: { fontSize: 22, fontWeight: '800' },
  h6: { fontSize: 18, fontWeight: '800' },
  s1: { fontSize: 15, fontWeight: '600' },
  s2: { fontSize: 13, fontWeight: '600' },
  p1: { fontSize: 15, fontWeight: '400' },
  p2: { fontSize: 13, fontWeight: '400' },
  c1: { fontSize: 12, fontWeight: '400' },
  c2: { fontSize: 12, fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '800' },
};

// Shared component metrics from Eva strict variables.
export const metrics = {
  borderRadius: 4,
  borderWidth: 1,
  sizeTiny: 24,
  sizeSmall: 32,
  sizeMedium: 40,
  sizeLarge: 48,
  sizeGiant: 56,
} as const;
