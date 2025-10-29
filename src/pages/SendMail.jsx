// src/pages/VerifyEmail.jsx
import {
  Box, Container, Grid2, Paper, Stack, Typography
} from "@mui/material";
import { sendEmailVerification } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { auth } from "../firebase";
import { imageURL } from "../utils/images";

const VERIFY_WINDOW_SECONDS = 600;
const POLL_MS = 5000;
const TICK_MS = 250;
const RESEND_COOLDOWN = 30;

export default function VerifyEmail() {
  const navigate = useNavigate();

  let loacl = localStorage.getItem("user-auth")

  // store target end time in a ref; compute secondsLeft from it
  const endAtRef = useRef(Date.now() + VERIFY_WINDOW_SECONDS * 1000);

  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000))
  );

  const pollRef = useRef(null);
  const tickRef = useRef(null);
  const startedRef = useRef(false); // StrictMode guard

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const clearTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
    startedRef.current = false;
  };

  const calcSecondsLeft = () =>
    Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));

  useEffect(() => {

    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      const user = auth.currentUser ? auth.currentUser : JSON.parse(loacl);
      if (!user) {
        toast.error("No signed-in user. Please log in again.");
        return;
      }
      await user.reload();
      if (user.emailVerified) {
        toast.success("Your email is already verified.");
        navigate("/reset-password", { replace: true });
        return;
      }
      await handleSend(); // initial send sets new endAt
      startTimers();
    })();

    // keep clock accurate after tab visibility changes
    const onVis = () => setSecondsLeft(calcSecondsLeft());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // stop timers at 0 (UI still visible)
  useEffect(() => {
    if (secondsLeft === 0) clearTimers();
  }, [secondsLeft]);

  function startTimers() {
    // high-frequency tick, compute from wall clock
    tickRef.current = setInterval(() => {
      setSecondsLeft(calcSecondsLeft());
    }, TICK_MS);

    // Poll for verification
    pollRef.current = setInterval(async () => {
      const user = auth.currentUser;


      if (!user) return;
      await user.reload();
      if (user.emailVerified) {
        clearTimers();
        navigate("/reset-password", { replace: true });
      }
    }, POLL_MS);
  }

  async function handleSend() {
    try {

      const user = auth.currentUser ? auth.currentUser : JSON.parse(loacl);
      if (!user) {
        toast.error("No signed-in user.");
        return;
      }

      await sendEmailVerification(user);
      toast.info(`Verification link sent to ${user.email}`);

      endAtRef.current = Date.now() + VERIFY_WINDOW_SECONDS * 1000;
      setSecondsLeft(calcSecondsLeft());
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to send verification email");
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: "flex",
        alignItems: "center",
        backgroundImage: `
              radial-gradient(1200px 1200px at 85% 85%, rgba(230,57,70,0.20) 0%, rgba(230,57,70,0.00) 60%),
              linear-gradient(180deg, rgba(230,57,70,0.16) 0%, rgba(255,255,255,0.40) 100%),
              #ffeef1
            `,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        px: { xs: 2, md: 4 },
        position: 'relative',
        bgcolor: '#fdecec', // base to keep light tone behind left panel
      }}
    >
      <Container maxWidth='xl'>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
                justifyContent: 'center',
                pl: { md: 1 },
                pr: { md: 3 },
              }}
            >
              {/* Illustration */}
              <Box
                component="img"
                src={imageURL.login}
                alt="illustration"
                sx={{
                  width: { xs: 300, sm: 360, md: 550 },
                  height: 'auto',
                  mb: { xs: 2, md: 0 },
                  filter: 'drop-shadow(0px 8px 24px rgba(0,0,0,0.10))',
                }}
              />

              {/* <Box
                sx={{
                  position: 'relative',
                  // maxWidth: { xs: 520, md: 560 },
                  textAlign: { xs: 'center', md: 'left' },
                  // the glow
                  '::before': {
                    content: '""',
                    position: 'absolute',
                    left: '25%',
                    bottom: { xs: -18, md: 10 },
                    transform: 'translateX(-30%)',
                    width: { xs: 360, md: 500 },
                    height: { xs: 70, md: 100 },
                    borderRadius: '50%',
                    background: '#fff',
                    // background:

                    filter: 'blur(10px)',
                    zIndex: 0,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Typography
                  variant="h3"
                  sx={{ color: '#1E252D', mb: 0.5, position: 'relative', zIndex: 1 }}
                >
                  Welcome Back to LeadFire
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: 'rgba(30,37,45,0.70)', position: 'relative', zIndex: 1 }}
                >
                  Manage agents, zones, and issues securely.
                </Typography>
              </Box> */}
            </Box>
          </Grid2>

          {/* Right side card */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: "relative", p: { xs: 3, md: 4 }, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "transparent" }}>
              <Paper elevation={0} sx={{ width: "100%", maxWidth: 500, borderRadius: 1.5, bgcolor: "#ffffff", p: { xs: 3, md: 4 }, boxShadow: "0 16px 40px rgba(0,0,0,0.12)", textAlign: "center" }}>
                <Stack spacing={1.2} justifyContent="center" sx={{ mb: 2 }}>
                  <Box component="img" src={imageURL?.logo} alt="LeadFire logo" height={64} sx={{ mx: "auto" }} />
                  <Typography variant="h4" sx={{ mt: 0.5, color: "#0f172a" }}>
                    Verify Your Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We’ve sent a verification link to your registered email address.
                    Please check your inbox and click the link to verify your account.
                  </Typography>
                </Stack>

                {/* Timer */}
                <Box sx={{ my: 2 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                    {mm} : {ss}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Min &nbsp;&nbsp;&nbsp;&nbsp; Sec
                  </Typography>
                </Box>

                <Typography variant="caption" color="warning.main" sx={{ display: "block", mb: 2 }}>
                  ⚠️ Important: The link will expire in 10 minutes. Complete verification as soon as possible.
                </Typography>
              </Paper>
            </Box>
          </Grid2>
        </Grid2>
      </Container>
    </Box>
  );
}
