import { Dimensions } from 'react-native';

// Drop-in replacement for react-native-size-matters@0.4.0 with the exact same
// math (guideline base 350x680, orientation-safe short/long dimension), so
// every scaled value renders identically to the old app. Computed at module
// scope like the original library — the POS runs locked to landscape, so the
// window never changes shape at runtime.

const { width, height } = Dimensions.get('window');
const [shortDimension, longDimension] =
  width < height ? [width, height] : [height, width];

const guidelineBaseWidth = 350;
const guidelineBaseHeight = 680;

export const scale = (size: number) =>
  (shortDimension / guidelineBaseWidth) * size;

export const verticalScale = (size: number) =>
  (longDimension / guidelineBaseHeight) * size;

export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export const moderateVerticalScale = (size: number, factor = 0.5) =>
  size + (verticalScale(size) - size) * factor;
