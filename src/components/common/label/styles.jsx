import Box from "@mui/material/Box";
import { alpha, styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

export const StyledLabel = styled(Box)(({ theme, ownerState }) => {
  const filledVariant = ownerState.variant === "filled";

  const outlinedVariant = ownerState.variant === "outlined";

  const softVariant = ownerState.variant === "soft";

  const ghostVariant = ownerState.variant === "ghost";

  const defaultStyle = {
    ...(ownerState.color === "default" && {
      // FILLED
      ...(filledVariant && {
        color: alpha(theme.palette.text.primary, 0.8),
        backgroundColor: theme.palette.grey[1400],
      }),
      // OUTLINED
      ...(outlinedVariant && {
        backgroundColor: "transparent",
        color: alpha(theme.palette.text.primary, 0.8),
        border: `1px solid ${theme.palette.grey[1300]}`,
      }),
      // SOFT
      ...(softVariant && {
        color: alpha(theme.palette.text.primary, 0.8),
        backgroundColor: theme.palette.grey[1400],
      }),
      // GHOST
      ...(ghostVariant && {
        color: alpha(theme.palette.text.primary, 0.8),
        backgroundColor: theme.palette.grey[1400],
        border: `1px solid ${theme.palette.grey[1300]}`,
      }),
    }),
  };

  const colorStyle = {
    ...(ownerState.color !== "default" && {
      // FILLED
      ...(filledVariant && {
        color: theme.palette[ownerState.color].contrastText,
        backgroundColor: theme.palette[ownerState.color].main,
      }),
      // OUTLINED
      ...(outlinedVariant && {
        backgroundColor: "transparent",
        color: theme.palette[ownerState.color].main,
        border: `1px solid ${theme.palette[ownerState.color].main}`,
      }),
      // SOFT
      ...(softVariant && {
        color: theme.palette[ownerState.color].main,
        backgroundColor: theme.palette[ownerState.color].lighter,
      }),
      // GHOST
      ...(ghostVariant && {
        color: theme.palette[ownerState.color].main,
        backgroundColor: theme.palette[ownerState.color].lighter,
        border: `1px solid ${theme.palette[ownerState.color].main}`,
      }),
    }),
  };

  return {
    minWidth: 24,
    borderRadius: 6,
    cursor: "default",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    textTransform: "capitalize",
    padding: theme.spacing(0.75),
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightSemiBold,
    transition: theme.transitions.create("all", {
      duration: theme.transitions.duration.shorter,
    }),
    ...defaultStyle,
    ...colorStyle,
  };
});
