// Design tokens ported 1:1 from the legacy app:
// - Brand scales: custom-theme.json (merged over @eva-design/eva light)
// - Basic scale + semantic mappings: @eva-design/eva@2.1.1 themes/light.json
// Values must not be "improved" — pixel/color parity with the old app is the contract.

export const palette = {
  primary100: '#D9F9C7',
  primary200: '#ACF492',
  primary300: '#71E059',
  primary400: '#3DC130',
  primary500: '#009900',
  primary600: '#00830B',
  primary700: '#006E13',
  primary800: '#005817',
  primary900: '#004919',

  success100: '#DAFBD4',
  success200: '#AFF7AA',
  success300: '#7BE97E',
  success400: '#57D366',
  success500: '#28B747',
  success600: '#1D9D45',
  success700: '#148341',
  success800: '#0C6A3B',
  success900: '#075737',

  info100: '#CAF7FD',
  info200: '#97E9FB',
  info300: '#62D1F5',
  info400: '#3BB6EC',
  info500: '#008EE0',
  info600: '#006EC0',
  info700: '#0052A1',
  info800: '#003A81',
  info900: '#00296B',

  warning100: '#FFFACC',
  warning200: '#FFF499',
  warning300: '#FFEC66',
  warning400: '#FFE43F',
  warning500: '#FFD800',
  warning600: '#DBB600',
  warning700: '#B79500',
  warning800: '#937600',
  warning900: '#7A5F00',

  danger100: '#FDE5D5',
  danger200: '#FBC5AC',
  danger300: '#F59B81',
  danger400: '#EC7460',
  danger500: '#E03A2F',
  danger600: '#C02225',
  danger700: '#A11726',
  danger800: '#810E24',
  danger900: '#6B0923',

  basic100: '#FFFFFF',
  basic200: '#F7F9FC',
  basic300: '#EDF1F7',
  basic400: '#E4E9F2',
  basic500: '#C5CEE0',
  basic600: '#8F9BB3',
  basic700: '#2E3A59',
  basic800: '#222B45',
  basic900: '#1A2138',
  basic1000: '#151A30',
  basic1100: '#101426',
} as const;

export type Status =
  | 'basic'
  | 'primary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger';

// color-{status}-default resolves to the 500 step in Eva light.
export const statusColors: Record<Status, string> = {
  basic: palette.basic300,
  primary: palette.primary500,
  success: palette.success500,
  info: palette.info500,
  warning: palette.warning500,
  danger: palette.danger500,
};

// color-{status}-transparent-* used by outline/ghost buttons: rgba(500, alpha)
const statusRgb: Record<Status, string> = {
  basic: '143, 155, 179',
  primary: '0, 153, 0',
  success: '40, 183, 71',
  info: '0, 142, 224',
  warning: '255, 216, 0',
  danger: '224, 58, 47',
};

export const statusTransparent = (status: Status, alpha: number) =>
  `rgba(${statusRgb[status]}, ${alpha})`;

export const colors = {
  // Layout levels: background-basic-color-1..4
  backgroundLevel1: palette.basic100,
  backgroundLevel2: palette.basic200,
  backgroundLevel3: palette.basic300,
  backgroundLevel4: palette.basic400,

  // Text
  textBasic: palette.basic800,
  textHint: palette.basic600,
  textDisabled: 'rgba(143, 155, 179, 0.48)',
  textControl: palette.basic100,

  // Borders: border-basic-color-1..5
  border1: palette.basic100,
  border2: palette.basic200,
  border3: palette.basic300,
  border4: palette.basic400,
  border5: palette.basic500,

  // Controls
  disabledBackground: 'rgba(143, 155, 179, 0.24)', // color-basic-transparent-300
  backdrop: 'rgba(0, 0, 0, 0.5)',
} as const;
