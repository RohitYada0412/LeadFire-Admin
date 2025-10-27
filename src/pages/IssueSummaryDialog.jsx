// IssueSummaryDialog.jsx
import * as React from "react";
import {
  Avatar,
  Backdrop,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2,
  IconButton,
  ImageList,
  ImageListItem,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Circle, GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { circleOptions, mapOptions, toMeters } from "../utils/service";

// Small helper – safe access
const safe = (v, fallback = "-") => (v == null || v === "" ? fallback : v);

export default function IssueSummaryDialog({ open, onClose, issue, loading }) {

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const lat = Number(issue?.lat ?? issue?.latitude);
  const lng = Number(issue?.lng ?? issue?.long ?? issue?.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const center = hasCoords ? { lat, lng } : null;

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1, overflow: "hidden" }
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            fontSize: 24,
          }}
        >
          Issue Summary
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 12, top: 10 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            bgcolor: (t) => t.palette.background.paper,
            p: 2.5
          }}
        >
          {/* Header Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: .8,
              borderColor: (t) => t.palette.divider,
              background:
                "linear-gradient(0deg, rgba(230,57,70,0.06), rgba(230,57,70,0.06))",
            }}
          >
            <Grid2 container spacing={2}>
              <Grid2 item size={{ xs: 12, md: 5.5 }}>
                <SectionLabel>Issue Summary</SectionLabel>
                <Typography variant="caption" color="text.secondary"
                  sx={{ mt: 0.75 }}>
                  Issue Title
                </Typography>

                <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: "pre-line" }}>
                  {safe(issue?.issueType)}
                </Typography>
              </Grid2>

              {/* Zone & location */}
              <Grid2 item size={{ xs: 12, md: 3.5 }}>

                <Typography variant="caption" color="text.secondary"
                  sx={{ mt: 0.75 }}>
                  Zone & Location
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  <strong>{safe(issue?.zoneName)}</strong>
                  {issue?.address ? ` • ${issue.address}` : ""}
                </Typography>

                {issue?.subLocation ? (
                  <Typography variant="body2" color="text.secondary">
                    {issue.subLocation}
                  </Typography>
                ) : null}
              </Grid2>

              {/* Assigned agent */}
              <Grid2 item size={{ xs: 12, md: 3 }}>
                {/* <SectionLabel>Assigned Agent</SectionLabel> */}

                <Typography variant="caption" color="text.secondary"
                  sx={{ mt: 0.75 }}>
                  Assigned Agent
                </Typography>

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.75 }}>
                  <Avatar
                    src={issue?.agent?.photoUrl}
                    alt={issue?.agentName}
                    sx={{ width: 36, height: 36 }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {safe(issue?.agent?.agent_name)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safe(issue?.agent?.email)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid2>
            </Grid2>
          </Paper>

          {/* Photos */}
          <SectionHeader>Photos</SectionHeader>
          {Array.isArray(issue?.photos) && issue.photos.length ? (
            <ImageList cols={4} gap={12} sx={{ mb: 2.5 }}>
              {issue.photos.map((src, i) => (
                <ImageListItem key={`${src}-${i}`}>
                  <Box
                    component="img"
                    src={src?.url}
                    alt={`photo-${i}`}
                    sx={{
                      width: "100%",
                      height: 140,
                      objectFit: 'contain',
                      borderRadius: 1.5
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <EmptyHint text="No photos attached." />
          )}

          {/* Location */}
          <SectionHeader>Location</SectionHeader>
          <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
            <Typography
              component="span"
              sx={{ fontSize: 18, lineHeight: "20px", mt: "2px" }}
            >
              📍
            </Typography>
            <Typography variant="body2">{safe(issue?.address)}</Typography>
          </Stack>

          <Box sx={{
            height: 260, borderRadius: 1.5, overflow: "hidden",
            border: "1px solid", borderColor: "divider", mb: 0.5
          }}>
            {loadError && (
              <Box sx={{ p: 2, color: "text.secondary" }}>Map failed to load.</Box>
            )}

            {isLoaded && center ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={center}
                zoom={13}
                options={mapOptions}
              >
                <Marker position={center} />
                <Circle
                  center={center}
                  radius={toMeters(issue?.radius_value || 0, issue?.radius_unit)}
                  options={circleOptions}
                />
              </GoogleMap>
            ) : (
              !loadError && (
                <Box sx={{
                  width: "100%", height: "100%",
                  display: "grid", placeItems: "center",
                  bgcolor: (t) => t.palette.action.hover, color: "text.secondary"
                }}>
                  {center ? "Loading map…" : "No coordinates"}
                </Box>
              )
            )}
          </Box>
        </DialogContent>
      </Dialog>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </React.Fragment>
  );
}

function SectionHeader({ children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <Typography variant="subtitle1" fontWeight={800}>
        {children}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Stack>
  );
}

function SectionLabel({ children }) {
  return (
    <Typography
      variant="subtitle1"
      fontWeight={800}
      sx={{ mb: 0.25 }}
    >
      {children}
    </Typography>
  );
}

function EmptyHint({ text }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: 1.5,
        borderStyle: "dashed",
        color: "text.secondary",
        bgcolor: (t) => (t.palette.mode === "light" ? "#fafafa" : "transparent")
      }}
    >
      <Typography variant="body2">{text}</Typography>
    </Paper>
  );
}
