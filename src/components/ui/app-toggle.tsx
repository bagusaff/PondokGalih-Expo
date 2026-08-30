import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors, statusColors, type Status } from '@/theme';

// Replacement for UI Kitten <Toggle>: 52x32 track, 28px thumb, label right.

export type AppToggleProps = {
  checked: boolean;
  onChange: () => void;
  status?: Status;
  children?: ReactNode;
};

export function AppToggle({
  checked,
  onChange,
  status = 'primary',
  children,
}: AppToggleProps) {
  return (
    <Pressable
      onPress={onChange}
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: 52,
          height: 32,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: checked ? statusColors[status] : colors.border5,
          backgroundColor: checked
            ? statusColors[status]
            : 'rgba(143, 155, 179, 0.16)',
          justifyContent: 'center',
          alignItems: checked ? 'flex-end' : 'flex-start',
          paddingHorizontal: 1,
        }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
        />
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
