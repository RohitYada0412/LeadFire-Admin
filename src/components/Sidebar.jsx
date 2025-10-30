// SideBar.jsx
import React from "react"
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';



import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material"
import ArrowBackIosNewSharpIcon from "@mui/icons-material/ArrowBackIosNewSharp"
import { NavLink, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"           // <-- add
import Iconify from "./common/iconify/Iconify"
import { signOut } from "../store/features/auth/authSlice"
import { imageURL } from "../utils/images"

const DRAWER_WIDTH = 270

// NOTE: make "Logout" an action instead of a route

function DrawerContent({ setOpen, onLogout, isUser }) {

  const navItems = [
    { text: "Dashboard", to: "/dashboard", icon: <Iconify icon="mage:dashboard-fill" width={20} height={20} /> },
    { text: "Manage Companies", to: "/company", icon: <Iconify icon="raphael:user" width={20} height={20} /> },
    // { text: "Agents", to: "/agents", icon: <Iconify icon="raphael:user" width={20} height={20} /> },
    // { text: "Zones", to: "/zones", icon: <Iconify icon="hugeicons:location-10" width={20} height={20} /> },
    { text: "Logout", action: "logout", icon: <Iconify icon="humbleicons:logout" width={20} height={20} /> },
  ]
  const companyItem = [
    { text: "Dashboard", to: "/dashboard", icon: <Iconify icon="mage:dashboard-fill" width={20} height={20} /> },
    { text: "Manage My Agents", to: "/agents", icon: <Iconify icon="mdi:account-tie-outline" width={20} height={20} /> },
    { text: "Zones", to: "/zones", icon: <Iconify icon="hugeicons:location-10" width={20} height={20} /> },
    // { text: "Issues", to: "/issues", icon: <Iconify icon="ph:warning" width={20} height={20} /> },
    { text: "Logout", action: "logout", icon: <Iconify icon="humbleicons:logout" width={20} height={20} /> },
  ]

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", color: "#fff" }}>
      <Toolbar sx={{ minHeight: 68, px: 2, gap: 1.25, py: 1 }}>
        <Box
          component="img"
          src={imageURL.logo}
          alt="LeadFire"
          sx={{ width: '100%', height: 100, objectFit: "contain" }}
        />
        {/* <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
          LeadFire
        </Typography> */}

        {/* mobile close */}
        <IconButton
          onClick={() => setOpen(false)}
          sx={{
            display: { lg: "none" },
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
          aria-label="close sidebar"
        >
          <ArrowBackIosNewSharpIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Toolbar>

      <List sx={{ px: 1.25 }}>
        {(!isUser ? navItems : companyItem).map(({ text, to, icon, action }) => {

          const commonSx = {
            color: "rgba(255,255,255,0.92)",
            borderRadius: 0.5,
            height: 40,
            mb: 0.75,
            px: 1.25,
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            "& .MuiListItemIcon-root": { color: "inherit", minWidth: 36 },
            "&.active": {
              bgcolor: "#E63946",
              color: "#fff",
              "& .MuiListItemIcon-root": { color: "#fff" },
            },
          }

          // Render Logout as a button with onClick
          // if (action === "logout") {
          //   return (
          //     <ListItemButton
          //       key="logout"
          //       onClick={() => {
          //         setOpen(false)
          //         onLogout?.()
          //       }}
          //       sx={commonSx}
          //       aria-label="Logout"
          //     >
          //       <ListItemIcon>{icon}</ListItemIcon>
          //       <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
          //     </ListItemButton>
          //   )
          // }


          const [confirmLogout, setConfirmLogout] = useState(false);

          if (action === "logout") {
            return (
              <>
                <ListItemButton
                  key="logout"
                  onClick={() => {
                    setOpen(false);       // close menu
                    setConfirmLogout(true); // show confirmation dialog
                  }}
                  sx={commonSx}
                  aria-label="Logout"
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
                </ListItemButton>

                {/* Logout confirmation dialog */}
                <Dialog
                  open={confirmLogout}
                  onClose={() => setConfirmLogout(false)}
                  PaperProps={{
                    sx: { borderRadius: 1, p: 2, minWidth: 340 }
                  }}
                >
                  <DialogTitle sx={{ textAlign: "center", fontWeight: 600, pb: 1 }}>
                    Logout Confirmation
                  </DialogTitle>

                  <DialogContent sx={{ textAlign: "center", pb: 5 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Are you sure you want to logout?
                      You will need to sign in again to access your account.
                    </Typography>
                  </DialogContent>

                  <DialogActions
                    sx={{
                      justifyContent: "center", // ✅ centers buttons
                      gap: 2,
                      pb: 2
                    }}
                  >
                    <Button
                      onClick={() => setConfirmLogout(false)}
                      variant="outlined"
                      color="inherit"
                      sx={{
                        textTransform: "none",
                        borderRadius: .8,
                        px: 5
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={() => {
                        setConfirmLogout(false);
                        onLogout?.();
                      }}
                      variant="contained"
                      color="error"
                      sx={{
                        textTransform: "none",
                        borderRadius: .8,
                        px: 5
                      }}
                    >
                      Logout
                    </Button>
                  </DialogActions>
                </Dialog>


              </>
            );
          }






          return (
            <ListItemButton
              key={to}
              component={NavLink}
              to={to}
              end
              onClick={() => setOpen(false)}
              sx={commonSx}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 700, fontSize: 14 }} />
            </ListItemButton>
          )
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />
    </Box>
  )
}

export default function SideBar({ open, setOpen, isUser, drawerWidth = DRAWER_WIDTH }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Centralized logout handler
  const handleLogout = React.useCallback(() => {
    try {
      dispatch(signOut())
    } finally {
      navigate("/", { replace: true })
    }
  }, [dispatch, navigate])

  const paperBase = () => ({
    width: drawerWidth,
    bgcolor: "#1D3557",
    color: "#fff",
    borderRight: "none",
    boxShadow: "0 12px 28px rgba(0,0,0,0.20)",
    overflow: "hidden",
  })

  return (
    <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }} aria-label="sidebar">
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: (theme) => ({ ...paperBase(theme) }) }}
        sx={{ display: { xs: "block", lg: "none" } }}
      >
        <DrawerContent setOpen={setOpen} onLogout={handleLogout} isUser={isUser} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        PaperProps={{ sx: (theme) => ({ ...paperBase(theme) }) }}
        sx={{ display: { xs: "none", lg: "block" } }}
      >
        <DrawerContent setOpen={setOpen} onLogout={handleLogout} isUser={isUser} />
      </Drawer>
    </Box>
  )
}
