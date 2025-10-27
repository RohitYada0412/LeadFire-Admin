// src/theme/typography.js
export function remToPx(value) {
  return Math.round(parseFloat(value) * 16)
}
export function pxToRem(value) {
  return `${value / 16}rem`
}
export function responsiveFontSizes(sizes = {}) {
  const out = {}
  if (sizes.sm != null) out['@media (min-width:600px)']  = { fontSize: pxToRem(sizes.sm) }
  if (sizes.md != null) out['@media (min-width:900px)']  = { fontSize: pxToRem(sizes.md) }
  if (sizes.lg != null) out['@media (min-width:1200px)'] = { fontSize: pxToRem(sizes.lg) }
  if (sizes.xl != null) out['@media (min-width:1536px)'] = { fontSize: pxToRem(sizes.xl) }
  return out
}

const typography = {
  fontFamily: ['Jost', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,

  // “Welcome Back!” in your screenshot is 36 / 49 Jost Medium
  h3: { fontWeight: 500, fontSize: pxToRem(36), lineHeight: pxToRem(49) },

  h1: { fontWeight: 700, fontSize: pxToRem(48), ...responsiveFontSizes({ sm: 52, md: 56, lg: 64 }) },
  h2: { fontWeight: 600, fontSize: pxToRem(40), ...responsiveFontSizes({ sm: 44, md: 48, lg: 52 }) },
  h4: { fontWeight: 600, fontSize: pxToRem(24) },
  h5: { fontWeight: 600, fontSize: pxToRem(20) },
  h6: { fontWeight: 600, fontSize: pxToRem(18) },

  subtitle1: { fontWeight: 500, fontSize: pxToRem(16) },
  subtitle2: { fontWeight: 500, fontSize: pxToRem(14) },

  body1: { fontSize: pxToRem(16) },
  body2: { fontSize: pxToRem(14) },

  caption: { fontSize: pxToRem(12), fontWeight: 400 },
  overline: { fontSize: pxToRem(12), textTransform: 'uppercase', letterSpacing: 1 },
  button: { fontSize: pxToRem(15), textTransform: 'capitalize', fontWeight: 600 },
}

export default typography
