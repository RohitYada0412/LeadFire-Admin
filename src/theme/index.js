// src/theme/index.js
import { createTheme } from '@mui/material/styles'
import palette, { customGradients } from './palette'
import typography from './typography'

const theme = createTheme({
  palette,
  typography,
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, variant: 'contained' },
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, borderRadius: 999, paddingInline: 16, paddingBlock: 10 },
        containedPrimary: {
          backgroundColor: palette.primary.main,
          '&:hover': { backgroundColor: '#d62d3c' }, // darker crimson
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#F3F4F6', // Secondary/Grey 2 (light fill)
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.12)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.28)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: palette.primary.main, borderWidth: 1.5 },
          '& input': { color: '#0f172a' },
          '& input::placeholder': { color: 'rgba(15,23,42,0.55)', opacity: 1 },
          '& input:-webkit-autofill': {
            WebkitTextFillColor: '#0f172a',
            WebkitBoxShadow: '0 0 0 1000px #F3F4F6 inset',
            caretColor: '#0f172a',
            transition: 'background-color 9999s ease-out',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' },
      },
    },
  },
})

// expose your gradients on theme
theme.customGradients = customGradients

export default theme
