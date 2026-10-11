import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Divider, Alert } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';

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
  onPayPix?: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  cartItems,
  onFinish,
  onPayPix,
}) => {
  const total = cartItems.reduce((acc, item) => {
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
      <DialogTitle sx={{ color: 'black', fontSize: '1.1rem', fontWeight: 'bold' }}>
        Carrinho / Checkout
      </DialogTitle>
      <DialogContent dividers>
        {cartItems.length === 0 ? (
          <Typography variant="body2">Seu carrinho está vazio.</Typography>
        ) : (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Itens do Pedido
            </Typography>
            {cartItems.map((item, idx) => (
              <Box key={idx} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.qty}x {item.product.name}
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency((Number(item.product.price) || 0) * item.qty)}
                  </Typography>
                </Box>
                {item.observations && (
                  <Typography variant="caption" color="textSecondary">
                    Obs: {item.observations}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}

        {cartItems.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
              Resumo e Pagamento
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Subtotal:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{formatCurrency(total)}</Typography>
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Simulação de Valores:</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Débito (+1,25%):</Typography>
                <Typography variant="body2" color="textSecondary">{formatCurrency(totalDebito)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Crédito à Vista (+3,11%):</Typography>
                <Typography variant="body2" color="textSecondary">{formatCurrency(totalCredito)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Pix (Sem taxa):</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {formatCurrency(totalPix)}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" icon={<QrCode2Icon />} sx={{ mt: 2.5, borderRadius: 2 }}>
              Ao escolher <strong>Pagar com Pix</strong>, você receberá um QR Code dinâmico do <strong>Mercado Pago</strong> com 10 minutos de validade e confirmação automática do pagamento.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} color="inherit" size="small">
          Continuar comprando
        </Button>
        <Button 
          onClick={onFinish} 
          variant="outlined" 
          color="inherit"
          disabled={cartItems.length === 0}
          size="small"
        >
          Dar baixa manual
        </Button>
        {onPayPix && (
          <Button 
            onClick={onPayPix} 
            variant="contained" 
            color="primary"
            startIcon={<QrCode2Icon />}
            disabled={cartItems.length === 0}
            size="small"
            sx={{ fontWeight: 'bold' }}
          >
            Pagar com Pix (Mercado Pago)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

