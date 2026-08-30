import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  metrics,
  palette,
  statusColors,
  statusTransparent,
  type Status,
} from '@/theme';

// Replacement for UI Kitten <Button>. Metrics from @eva-design/eva@2.1.1
// mapping.json; medium (the legacy default) is exact, other sizes follow the
// same Eva table. Colors resolve against the app's custom theme.

export type ButtonAppearance = 'filled' | 'outline' | 'ghost';
export type ButtonSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';

export type AppButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  appearance?: ButtonAppearance;
  status?: Status;
  size?: ButtonSize;
  accessoryLeft?: ReactNode;
  accessoryRight?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const sizeTable: Record<
  ButtonSize,
  { minSize: number; fontSize: number; paddingVertical: number; paddingHorizontal: number }
> = {
  tiny: { minSize: metrics.sizeTiny, fontSize: 10, paddingVertical: 6, paddingHorizontal: 6 },
  small: { minSize: metrics.sizeSmall, fontSize: 12, paddingVertical: 8, paddingHorizontal: 8 },
  medium: { minSize: metrics.sizeMedium, fontSize: 14, paddingVertical: 12, paddingHorizontal: 10 },
  large: { minSize: metrics.sizeLarge, fontSize: 16, paddingVertical: 14, paddingHorizontal: 12 },
  giant: { minSize: metrics.sizeGiant, fontSize: 18, paddingVertical: 16, paddingHorizontal: 14 },
};

// color-{status}-active resolves to the 600 step (basic → basic-400).
const statusActive: Record<Status, string> = {
  basic: palette.basic400,
  primary: palette.primary600,
  success: palette.success600,
  info: palette.info600,
  warning: palette.warning600,
  danger: palette.danger600,
};

export function AppButton({
  appearance = 'filled',
  status = 'primary',
  size = 'medium',
  accessoryLeft,
  accessoryRight,
  children,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const dims = sizeTable[size];

  const container = (pressed: boolean): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: dims.minSize,
      minHeight: dims.minSize,
      borderRadius: metrics.borderRadius,
      borderWidth: metrics.borderWidth,
      paddingVertical: dims.paddingVertical,
      paddingHorizontal: dims.paddingHorizontal,
    };
    if (disabled) {
      return {
        ...base,
        backgroundColor: appearance === 'ghost' ? 'transparent' : colors.disabledBackground,
        borderColor: appearance === 'ghost' ? 'transparent' : colors.disabledBackground,
      };
    }
    if (appearance === 'filled') {
      const bg = pressed ? statusActive[status] : statusColors[status];
      return { ...base, backgroundColor: bg, borderColor: bg };
    }
    if (appearance === 'outline') {
      return {
        ...base,
        backgroundColor: statusTransparent(status, pressed ? 0.24 : 0.08),
        borderColor: statusColors[status],
      };
    }
    return {
      ...base,
      backgroundColor: pressed ? statusTransparent(status, 0.16) : 'transparent',
      borderColor: 'transparent',
    };
  };

  const textColor = disabled
    ? colors.textDisabled
    : appearance === 'filled'
      ? colors.textControl
      : status === 'basic'
        ? colors.textHint
        : statusColors[status];

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [container(pressed), style]}>
      {accessoryLeft}
      {children != null && (
        <Text
          style={{
            color: textColor,
            fontSize: dims.fontSize,
            fontWeight: 'bold',
            marginHorizontal: 10,
          }}>
          {children}
        </Text>
      )}
      {accessoryRight}
    </Pressable>
  );
}
