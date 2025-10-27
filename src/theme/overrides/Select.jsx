// ----------------------------------------------------------------------

export default function Select(theme) {
  return {
    MuiSelect: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.grey[500], // Default disabled color
            },
          },
          "&.Mui-error": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.error.main, // Error color
            },
            "&.Mui-disabled": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.error.main, // Ensure error color when disabled
              },
            },
          },
        },
      },
    },
  };
}
