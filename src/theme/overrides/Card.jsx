// ----------------------------------------------------------------------

import { alpha } from "@mui/material";

export default function Card(theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          boxShadow: theme.customShadows.card,
          borderRadius: Number(theme.shape.borderRadius) * 2,
          position: "relative",
          zIndex: 0,
          ...(ownerState.variant === "outlined" && {
            borderColor: `${alpha(theme.palette.grey[1200], 0.4)}`,
            boxShadow: "0px 0px 25px 0px #0000000A",
          }),
        }),
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: "h6" },
        subheaderTypographyProps: { variant: "body2" },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(3, 3, 0),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
        },
      },
    },
  };
}
