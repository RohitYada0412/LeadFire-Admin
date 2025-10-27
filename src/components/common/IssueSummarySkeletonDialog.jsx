// IssueSummarySkeletonDialog.jsx
import * as React from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Divider,
  Skeleton,
  ImageList,
  ImageListItem,
  Typography,
  Grid2,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function IssueSummarySkeletonDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 1, overflow: "hidden" } }}>
      <DialogTitle sx={{ pr: 6, fontSize: 24 }}>
        Issue Summary
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 12, top: 10 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: (t) => t.palette.background.paper, p: 2.5 }}>
        {/* Header card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 0.8,
            borderColor: (t) => t.palette.divider,
            background: "linear-gradient(0deg, rgba(230,57,70,0.06), rgba(230,57,70,0.06))",
          }}
        >
          <Grid2 container spacing={2}>
            {/* Issue Summary */}
            <Grid2 size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                Issue Summary
              </Typography>
              <Skeleton variant="text" width={120} />
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="60%" height={28} />
            </Grid2>

            {/* Zone & Location */}
            <Grid2 xs={12} md={3}>
              <Skeleton variant="text" width={130} />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="70%" />
            </Grid2>

            {/* Assigned Agent */}
            <Grid2 xs={12} md={3}>
              <Skeleton variant="text" width={120} />
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.75 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" />
                  <Skeleton variant="text" width="60%" />
                </Box>
              </Stack>
            </Grid2>
          </Grid2>
        </Paper>

        {/* Photos */}
        <SectionHeader>Photos</SectionHeader>
        <ImageList cols={4} gap={12} sx={{ mb: 2.5 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ImageListItem key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 1.5 }} />
            </ImageListItem>
          ))}
        </ImageList>

        {/* Location */}
        <SectionHeader>Location</SectionHeader>
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.5 }}>
          <Skeleton variant="text" width="80%" />
        </Stack>

        {/* Map placeholder */}
        <Box
          sx={{
            height: 260,
            borderRadius: 1.5,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            mb: 0.5,
          }}
        >
          <Skeleton variant="rounded" width="100%" height="100%" />
        </Box>
      </DialogContent>
    </Dialog>
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
