import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider } from '@mui/material';

interface CartItem {
  product: any;
  qty: number;
  observations: string;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onFinish: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose, cartItems, onFinish }) => {
  const total = cartItems.reduce((acc, item) => {
    // Assuming product.price exists and is a number. If not, default to 0.
    const price = Number(item.product.price) || 0;
    return acc + price * item.qty;
  }, 0);

  const debitoFee = 0.0125;
  const creditoFee = 0.0311;

  const totalDebito = total * (1 + debitoFee);
  const totalCredito = total * (1 + creditoFee);
  const totalPix = total;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{color: 'black'}}>Carrinho / Checkout</DialogTitle>
      <DialogContent dividers>
        {cartItems.length === 0 ? (
          <Typography>Seu carrinho está vazio.</Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Itens do Pedido</Typography>
            {cartItems.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    {item.qty}x {item.product.name}
                  </Typography>
                  <Typography>
                    {formatCurrency((Number(item.product.price) || 0) * item.qty)}
                  </Typography>
                </Box>
                {item.observations && (
                  <Typography variant="body2" color="textSecondary">
                    Obs: {item.observations}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {cartItems.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Resumo e Pagamento</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography sx={{ fontWeight: 'bold' }}>{formatCurrency(total)}</Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Simulação de Valores:</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography>Débito (+1,25%):</Typography>
                <Typography>{formatCurrency(totalDebito)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography>Crédito à Vista (+3,11%):</Typography>
                <Typography>{formatCurrency(totalCredito)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography>Pix (Sem taxa):</Typography>
                <Typography>{formatCurrency(totalPix)}</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', textAlign: 'center' }}>
              <Typography variant="subtitle2" gutterBottom>[QR CODE PIX]</Typography>
              <Typography variant="caption" color="textSecondary">
                Escaneie com o app do seu banco
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Continuar comprando
        </Button>
        <Button 
          onClick={onFinish} 
          variant="contained" 
          color="success"
          disabled={cartItems.length === 0}
        >
          Dar baixa
        </Button>
      </DialogActions>
    </Dialog>
  );
};
