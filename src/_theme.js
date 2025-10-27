import { createTheme } from '@mui/material/styles'

const primary = import.meta.env.VITE_THEME_PRIMARY || '#4f46e5'
const secondary = import.meta.env.VITE_THEME_SECONDARY || '#06b6d4'
const error = import.meta.env.VITE_THEME_ERROR || '#ef4444'
const warning = import.meta.env.VITE_THEME_WARNING || '#f59e0b'
const success = import.meta.env.VITE_THEME_SUCCESS || '#22c55e'
// const background = import.meta.env.VITE_THEME_BG || '#0b1020'
const surface = import.meta.env.VITE_THEME_SURFACE || '#12172a'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: primary },
    secondary: { main: secondary },
    error: { main: error },
    warning: { main: warning },
    success: { main: success },
    background: {
      default: '#fff',
      paper: surface
    }
  },
  shape: { borderRadius: 12 },
  typography: { fontFamily: 'Inter, Roboto, sans-serif' },
  components: {
    MuiButton: {
      defaultProps: { variant: 'contained', disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 10, fontWeight: 600 }
      }
    },
    MuiTextField: { defaultProps: { size: 'medium', fullWidth: true } },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' } }
    }
  }
})

export default theme
