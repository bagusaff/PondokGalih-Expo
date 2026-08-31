import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

// Live on-screen keyboard height (0 when hidden). Needed because RN Modals
// with statusBarTranslucent don't get Android's automatic adjustResize —
// dialogs must make room for the keyboard themselves.
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return keyboardHeight;
}
