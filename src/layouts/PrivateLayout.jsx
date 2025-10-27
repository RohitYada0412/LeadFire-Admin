import React from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useSelector } from "react-redux";

export default function PrivateLayout() {
  const [open, setOpen] = React.useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const { isUser } = useSelector((state) => state.auth)

  React.useEffect(() => {
    if (isDesktop) setOpen(false);
  }, [isDesktop]);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.paper" }}>
      <Header open={open} setOpen={setOpen} />
      <Sidebar open={open} setOpen={setOpen} drawerWidth={270} isUser={isUser} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,

        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
