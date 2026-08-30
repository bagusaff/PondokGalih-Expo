import type { ReactNode } from 'react';
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, statusColors } from '@/theme';

// Replacement for UI Kitten <Radio>/<RadioGroup> (default appearance,
// primary status). Eva metrics: 20x20 circle, 12x12 inner dot, text s2
// (13/600) with 12px horizontal margin.

export type AppRadioProps = {
  checked?: boolean;
  onPress?: () => void;
  children?: ReactNode;
};

export function AppRadio({ checked, onPress, children }: AppRadioProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: checked ? statusColors.primary : colors.border5,
          backgroundColor: checked ? 'rgba(0, 153, 0, 0.08)' : colors.backgroundLevel1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked && (
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: statusColors.primary,
            }}
          />
        )}
      </View>
      {children != null && (
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: colors.textBasic,
            marginHorizontal: 12,
          }}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

export type AppRadioGroupProps = {
  selectedIndex: number | null;
  onChange: (index: number) => void;
  labels: string[];
  style?: StyleProp<ViewStyle>;
};

export function AppRadioGroup({
  selectedIndex,
  onChange,
  labels,
  style,
}: AppRadioGroupProps) {
  return (
    <View style={style}>
      {labels.map((label, index) => (
        <AppRadio
          key={label}
          checked={selectedIndex === index}
          onPress={() => onChange(index)}>
          {label}
        </AppRadio>
      ))}
    </View>
  );
}
