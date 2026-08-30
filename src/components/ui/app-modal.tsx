import type { ReactNode } from 'react';
import { Modal, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';

// Replacement for react-native-modal / UI Kitten modals: RN core Modal with
// fade + centered content over a 50% black backdrop, tap-outside to dismiss.

export type AppModalProps = {
  visible: boolean;
  onBackdropPress?: () => void;
  children: ReactNode;
  // Styles the content wrapper (size/position of the dialog itself).
  contentStyle?: StyleProp<ViewStyle>;
};

export function AppModal({
  visible,
  onBackdropPress,
  children,
  contentStyle,
}: AppModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onBackdropPress}>
      <Pressable
        onPress={onBackdropPress}
        style={{
          flex: 1,
          backgroundColor: colors.backdrop,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {/* Stop backdrop press from bubbling into the dialog content. */}
        <Pressable onPress={() => {}} style={contentStyle}>
          <View>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
