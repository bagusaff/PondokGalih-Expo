import { useEffect } from 'react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { statusColors, type Status } from '@/theme';

// Replacement for UI Kitten <Spinner>: rotating arc. Size/borderWidth table
// straight from Eva's Spinner mapping.

export type SpinnerSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';

const sizeTable: Record<SpinnerSize, { size: number; borderWidth: number }> = {
  tiny: { size: 16, borderWidth: 2.3 },
  small: { size: 20, borderWidth: 2.8 },
  medium: { size: 24, borderWidth: 3.4 },
  large: { size: 28, borderWidth: 3.9 },
  giant: { size: 32, borderWidth: 4.5 },
};

export type AppSpinnerProps = {
  size?: SpinnerSize;
  status?: Status;
};

export function AppSpinner({ size = 'medium', status = 'primary' }: AppSpinnerProps) {
  const { size: dim, borderWidth } = sizeTable[size];
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 800, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderWidth,
          borderColor: statusColors[status],
          borderTopColor: 'transparent',
        },
        animatedStyle,
      ]}
    />
  );
}
