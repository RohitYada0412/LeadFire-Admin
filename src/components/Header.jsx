import { useLocation } from "react-router-dom";

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import { filter, get } from "lodash";

export const StyledTableCell = styled("tr")(({ theme }) => ({
  padding: "8px",
}));

// ----------------------------------------------------------------------//
const NAV_WIDTH = 250;

const HEADER_MOBILE = 60;

const HEADER_DESKTOP = 60;

const StyledRoot = styled(AppBar)(({ theme }) => ({
  color: theme.palette.text.primary,
  background: theme.palette.background.paper,
  [theme.breakpoints.up("lg")]: {
    width: `calc(100% - ${NAV_WIDTH + 1}px)`,
    boxShadow: "4px 1px 10px  rgba(0,102,205,0.2665441176470589)",
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up("lg")]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 3),
  },
}));

const Header = ({ open, setOpen }) => {
  const location = useLocation();
  // const dispatch = useDispatch();
  // const dispatch = useDispatch();

  const handleNotificationClick = () => { };

  const headingList = [
    { path: '/', label: "Dashboard" },
    { path: '', label: "Warranty" },
    { path: '', label: "Store Policies" },
  ];
  const headingContent = filter(headingList, (item) => {
    return item.path === location.pathname;
  });

  return (
    <>
      <StyledRoot>
        <StyledToolbar>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexGrow: 1,
              border: "none",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setOpen(true)}
              sx={{ display: { lg: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h3"
              sx={{ fontWeight: 500, fontSize: "26px", marginLeft: 2 }}
              color="text.primary"
            >
              {get(headingContent, "[0].label", "")}
            </Typography>

            {headingContent.length > 0 &&
              headingContent[0].path !== "/app/notification" && (
                ''
              )}
            <IconButton
              color="inherit"
              aria-label="notification"
              onClick={handleNotificationClick}
            >
              <Badge
                max={999}
                badgeContent={10}
                color="error"
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </StyledToolbar>
      </StyledRoot>
    </>
  );
};

export default Header;
