import { useState, type ReactNode } from 'react';
import {
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, metrics, palette, statusColors } from '@/theme';

// Replacement for UI Kitten <Input> (default appearance).
// Eva values: bg basic-200 / border basic-400; focused: bg basic-100 /
// border primary; radius 4; label 12/800 hint, marginBottom 4.
// Sizes (Eva table): medium minH 40 pv7, large minH 48 pv11 — both text 15.

export type InputSize = 'medium' | 'large';

const sizeTable: Record<InputSize, { minHeight: number; paddingVertical: number }> = {
  medium: { minHeight: metrics.sizeMedium, paddingVertical: 7 },
  large: { minHeight: metrics.sizeLarge, paddingVertical: 11 },
};

export type AppInputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  size?: InputSize;
  accessoryLeft?: ReactNode;
  accessoryRight?: ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppInput({
  label,
  size = 'medium',
  accessoryLeft,
  accessoryRight,
  disabled,
  style,
  onFocus,
  onBlur,
  ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const dims = sizeTable[size];

  const container: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: dims.minHeight,
    borderRadius: metrics.borderRadius,
    borderWidth: metrics.borderWidth,
    paddingHorizontal: 8,
    backgroundColor: disabled
      ? colors.disabledBackground
      : focused
        ? palette.basic100
        : palette.basic200,
    borderColor: focused ? statusColors.primary : colors.border4,
  };

  return (
    <View style={style}>
      {label != null && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '800',
            color: colors.textHint,
            marginBottom: 4,
          }}>
          {label}
        </Text>
      )}
      <View style={container}>
        {accessoryLeft}
        <TextInput
          {...rest}
          editable={!disabled}
          placeholderTextColor={colors.textHint}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            marginHorizontal: 8,
            paddingVertical: dims.paddingVertical,
            fontSize: 15,
            color: disabled ? colors.textDisabled : colors.textBasic,
          }}
        />
        {accessoryRight}
      </View>
    </View>
  );
}
