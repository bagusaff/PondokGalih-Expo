import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, metrics, palette, statusColors } from '@/theme';

import { AppIcon } from './app-icon';

// Replacement for UI Kitten <Select> (medium). The closed field matches Eva
// exactly (Input-like box + chevron); the option list opens as a centered
// card (UI Kitten anchored it under the field — acceptable deviation, only
// visible while open).

export type SelectOption = { id: number | string; name: string };

export type AppSelectProps = {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  onSelect: (option: SelectOption, index: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function AppSelect({
  options,
  value,
  placeholder = 'Default',
  disabled,
  onSelect,
  style,
}: AppSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: metrics.sizeMedium,
            borderRadius: metrics.borderRadius,
            borderWidth: metrics.borderWidth,
            borderColor: colors.border4,
            backgroundColor: disabled
              ? colors.disabledBackground
              : palette.basic200,
            paddingHorizontal: 8,
          },
          style,
        ]}>
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            marginHorizontal: 8,
            fontSize: 15,
            color: disabled
              ? colors.textDisabled
              : value
                ? colors.textBasic
                : colors.textHint,
          }}>
          {value || placeholder}
        </Text>
        <AppIcon name="arrow-ios-forward-outline" size={20} fill={colors.textHint} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: colors.backdrop,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: palette.basic100,
              borderRadius: metrics.borderRadius,
              width: '40%',
              maxHeight: '60%',
              paddingVertical: 8,
            }}>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    onSelect(item, index);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: pressed
                      ? palette.basic200
                      : item.name === value
                        ? 'rgba(0, 153, 0, 0.08)'
                        : palette.basic100,
                  })}>
                  <Text
                    style={{
                      fontSize: 15,
                      color:
                        item.name === value ? statusColors.primary : colors.textBasic,
                    }}>
                    {item.name}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
