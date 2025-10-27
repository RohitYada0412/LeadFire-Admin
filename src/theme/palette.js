// src/theme/palette.js
import { alpha } from '@mui/material/styles'

// ====== TEXT COLORS (from your Figma) ======
export const TEXT = {
  black: '#1E252D',  // Text Color / Black
  grey1: '#6B7280',  // tweak if your figma "Grey 1" differs
  white: '#FFFFFF',
}

// ====== NEUTRALS ======
export const GREY = {
  0: '#FFFFFF',
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
}

// ====== BRAND COLORS (Primary group in Figma) ======
export const CRIMSON_RED = {
  lighter: '#F9D6DA',
  light:   '#F27E88',
  main:    '#E63946',  // Primary / Crimson Red
  dark:    '#C12A35',
  darker:  '#891B25',
  contrastText: '#FFFFFF',
}

export const DEEP_BLUE = {
  lighter: '#C7D2FE',
  light:   '#60A5FA',
  main:    '#1E3A8A',  // Primary / Deep Blue
  dark:    '#172554',
  darker:  '#0B1740',
  contrastText: '#FFFFFF',
}

// ====== SECONDARY SUPPORT COLORS (Secondary group in Figma) ======
export const SUPPORT = {
  crimsonLight:   '#FADDE1', // Secondary / Crimson Red Light
  deepBlueLight:  '#90CAF9', // Secondary / Deep Blue Light
  grey1:          '#9AA3AF', // Secondary / Grey 1
  grey2:          '#F3F4F6', // Secondary / Grey 2 (light fill for inputs)
  yellow:         '#F59E0B',
  green:          '#22C55E',
  red:            '#EF4444',
}

// ====== STATUS (can reuse support if you prefer) ======
export const SUCCESS = {
  lighter: '#DBFCD6',
  light:   '#84EE8A',
  main:    SUPPORT.green,
  dark:    '#1A8F4E',
  darker:  '#095F40',
  contrastText: '#FFFFFF',
}
export const WARNING = {
  lighter: '#FFF9CC',
  light:   '#FFE666',
  main:    '#FFCC00',
  dark:    '#B78B00',
  darker:  '#7A5700',
  contrastText: '#111827',
}
export const ERROR = {
  lighter: '#FEE5D8',
  light:   '#FB9D8C',
  main:    CRIMSON_RED.main, // keep errors on the brand red
  dark:    '#AF203B',
  darker:  '#750C32',
  contrastText: '#FFFFFF',
}
export const INFO = {
  lighter: '#DFF3FC',
  light:   '#9DCFF1',
  main:    '#5895D3',
  dark:    '#2C5797',
  darker:  '#102965',
  contrastText: '#FFFFFF',
}

// ====== GRADIENTS (from your “Gradient Color” styles) ======
export const GRADIENTS = {
  // tweak stops to your figma if needed
  indigo:  'linear-gradient(135deg, #0B1740 0%, #1E3A8A 100%)',
  magenta: 'linear-gradient(135deg, #7A304A 0%, #E63946 100%)',
  // the soft pink BG you referenced on login:
  loginSoftPink:
    'linear-gradient(180deg, rgba(230,57,70,0.16) 0%, rgba(255,255,255,0.40) 100%), #FFFFFF'
}

// ====== MUI PALETTE OBJECT ======
const palette = {
  common:  { black: '#000000', white: '#FFFFFF' },
  primary: CRIMSON_RED,   // <-- Primary = Crimson Red
  secondary: DEEP_BLUE,   // <-- Secondary = Deep Blue
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[300], 0.8),
  text: {
    primary: TEXT.black,
    secondary: TEXT.grey1,
    disabled: alpha(TEXT.black, 0.38),
    contrastText: TEXT.white,
  },
  background: {
    default: '#0B1020',  // app bg (dark)
    paper:   '#FFFFFF',  // cards (white) like your login form
  },
  action: {
    active: TEXT.black,
    hover: alpha(TEXT.black, 0.06),
    selected: alpha(TEXT.black, 0.12),
    disabled: alpha(TEXT.black, 0.38),
    disabledBackground: GREY[200],
    focus: alpha(TEXT.black, 0.24),
    hoverOpacity: 0.08,
  },
}

// expose gradients for easy use in sx: (theme) => theme.customGradients.indigo
export const customGradients = GRADIENTS

export default palette
