import type { ReactNode } from 'react';
import { Modal, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useKeyboardHeight } from '@/lib/use-keyboard-height';
import { colors } from '@/theme';

// Replacement for react-native-modal / UI Kitten modals: RN core Modal with
// fade + centered content over a 50% black backdrop, tap-outside to dismiss.
// Keyboard-aware by default: statusBarTranslucent modals don't get Android's
// adjustResize, so the backdrop pads itself by the keyboard height and the
// dialog re-centers in the space that remains.

export type AppModalProps = {
  visible: boolean;
  onBackdropPress?: () => void;
  children: ReactNode;
  // Styles the content wrapper (size/position of the dialog itself).
  contentStyle?: StyleProp<ViewStyle>;
  // Opt out for fullscreen dialogs that manage the keyboard themselves.
  avoidKeyboard?: boolean;
};

export function AppModal({
  visible,
  onBackdropPress,
  children,
  contentStyle,
  avoidKeyboard = true,
}: AppModalProps) {
  const keyboardHeight = useKeyboardHeight();

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
          paddingBottom: avoidKeyboard ? keyboardHeight : 0,
        }}>
        {/* Stop backdrop press from bubbling into the dialog content.
            contentStyle goes directly on this pressable so children's
            percentage sizes resolve against it, not an auto-sized wrapper. */}
        <Pressable onPress={() => {}} style={contentStyle}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
