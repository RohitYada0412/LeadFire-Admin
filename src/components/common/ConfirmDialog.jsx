// ConfirmDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";

const ConfirmDialog = ({ open, title, message, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth='sm'
    >
      {title && <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>}

      {message && (
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}   // stack on mobile, row on wider screens
          spacing={2}
          sx={{ width: '100%', justifyContent: 'center' }}
        >
          <Button fullWidth onClick={() => onClose(false)} color="inherit">
            Cancel
          </Button>

          <Button
            fullWidth
            onClick={() => { onConfirm(); onClose(false); }}
            variant="contained"
            color="error"
          >
            Confirm
          </Button>
        </Stack>
      </DialogActions>

    </Dialog>
  );
};

export default ConfirmDialog;
