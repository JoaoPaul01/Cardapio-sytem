import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Typography, TextField, IconButton, Box, Stack } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

interface ProductDialogProps {
  open: boolean;
  product: any;
  onClose: () => void;
  onAdd: (product: any, qty: number, observations: string, goToCart: boolean) => void;
}

export const ProductDialog: React.FC<ProductDialogProps> = ({ open, product, onClose, onAdd }) => {
  const [qty, setQty] = useState(1);
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (open) {
      setQty(1);
      setObservations('');
    }
  }, [open]);

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', color: 'black' }}>{product.name}</DialogTitle>
      <DialogContent dividers>
        {product.description && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {product.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Quantidade</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
              <RemoveIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>{qty}</Typography>
            <IconButton onClick={() => setQty(qty + 1)}>
              <AddIcon />
            </IconButton>
          </Box>
        </Box>
        <TextField
          label="Observações"
          multiline
          rows={3}
          fullWidth
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Ex: Tirar cebola, ponto da carne..."
        />
        <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'right', fontWeight: 'bold' }}>
          Subtotal: {((Number(product.price) || 0) * qty).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </Typography>
      </DialogContent>
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'flex-end', p: 2 }}
      >
        <Button
          onClick={() => onAdd(product, qty, observations, false)}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Continuar comprando
        </Button>
        <Button
          onClick={() => onAdd(product, qty, observations, true)}
          variant="contained"
          color="primary"
          sx={{ textTransform: 'none' }}
        >
          Avançar para o carrinho
        </Button>
      </Stack>
    </Dialog>
  );
};
