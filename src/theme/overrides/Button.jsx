import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export default function Button(theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          fontWeight: 600,
          textWrap: "nowrap",
          letterSpacing: 0.5,
          padding: theme.spacing(1, 2.1),
          borderRadius: 20,
          transition: ".2s all ease-in-out",
          "&:hover": {
            boxShadow: "none",
          },
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              "&:hover": {
                backgroundColor: theme.palette.primary.hoverBG,
                color: theme.palette.common.white,
                boxShadow: "none",
                transition: ".2s all ease-in-out",
              },
            }),
          ...(ownerState.varianttype === "ghost" && {
            border: "1.2px solid #8A8A8A66",
          }),
        }),
        sizeLarge: {
          fontSize: 16,
          height: 55,
          lineHeight: 1,
        },
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          "&:hover": {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          boxShadow: "none",
        },
        containedSecondary: {
          boxShadow: "none",
        },
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
