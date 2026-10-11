import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PixPaymentCard } from './PixPaymentCard';

interface PixPaymentDialogProps {
  open: boolean;
  orderId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PixPaymentDialog: React.FC<PixPaymentDialogProps> = ({
  open,
  orderId,
  onClose,
  onSuccess,
}) => {
  if (!orderId) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            position: 'relative',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        <PixPaymentCard
          orderId={orderId}
          onBack={onClose}
          onSuccess={() => {
            if (onSuccess) {
              onSuccess();
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
