import { alpha } from "@mui/material/styles";
import { pxToRem, responsiveFontSizes } from "../typography";

// ----------------------------------------------------------------------

export default function Input(theme) {
  return {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: 1,
          "&.Mui-disabled": {
            "& svg": { color: theme.palette.text.disabled },
          },
        },
        input: {
          "&::placeholder": {
            opacity: 1,
            fontWeight: 300,
            fontSize: pxToRem(14),
            ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }),
            color: theme.palette.text.secondary,
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        underline: {
          "&:before": {
            borderBottomColor: alpha(theme.palette.grey[500], 0.56),
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(theme.palette.grey[500], 0.12),
          "&:hover": {
            backgroundColor: alpha(theme.palette.grey[500], 0.16),
          },
          "&.Mui-focused": {
            backgroundColor: theme.palette.action.focus,
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.action.disabledBackground,
          },
        },
        underline: {
          "&:before": {
            borderBottomColor: alpha(theme.palette.grey[500], 0.56),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: 'transparent',
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha(theme.palette.grey[1200], 0.4),
          },
          "&.Mui-disabled": {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.grey[1200], // Darker text for better contrast
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.action.disabled,
            },
            "& .MuiInputBase-input": {
              color: theme.palette.grey[1200], // Adjust text color when disabled
            },
            "&::placeholder": {
              color: theme.palette.grey[600], // Adjust placeholder color when disabled
              opacity: 1,
            },
          },
          "&.Mui-error": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.error.main,
            },
            "&.Mui-disabled": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main,
              },
            },
          },
        },
        input: {
          fontSize: 16,
          "&.MuiInputBase-inputSizeSmall": {
            fontSize: 14,
            "&::placeholder": {
              fontSize: 14,
            },
          },
          "&::placeholder": {
            opacity: 1,
            fontWeight: 400,
            fontSize: 16,
            color: theme.palette.grey[800],
          },
        },
      },
    },
  };
}
