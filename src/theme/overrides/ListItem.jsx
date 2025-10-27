export default function MenuItem(theme) {
  return {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.lighter,
          },
        },
      },
    },
  };
}
