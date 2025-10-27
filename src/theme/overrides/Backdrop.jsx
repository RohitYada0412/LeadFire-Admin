import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export default function Backdrop(theme) {
  return {
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.common.black, 0.4),
          zIndex: 99999,
        },
        invisible: {
          background: "transparent",
        },
      },
    },
  };
}
