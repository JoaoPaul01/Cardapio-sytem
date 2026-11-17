import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export interface CartItem {
  product: any;
  qty: number;
  observations: string;
}

export interface ActiveOrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number | string;
  subtotal?: string | number;
  notes?: string;
  status?: string;
  product?: any;
}

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  tableNumber?: number;
  activeOrder?: any;
  activeOrderItems?: ActiveOrderItem[];
  cartItems: CartItem[];
  onUpdateCartItemQty: (index: number, newQty: number) => void;
  onRemoveCartItem: (index: number) => void;
  onUpdateActiveItemQty: (itemId: string, newQty: number) => Promise<void> | void;
  onRemoveActiveItem: (itemId: string) => Promise<void> | void;
  onConfirmNewItems?: () => Promise<void> | void;
  onFinish: () => void;
  onPayPix?: () => void;
  isPixLoading?: boolean;
  isManualLoading?: boolean;
  isConfirmingNewItems?: boolean;
  isUpdatingOrder?: boolean;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  open,
  onClose,
  tableNumber,
  activeOrder,
  activeOrderItems = [],
  cartItems,
  onUpdateCartItemQty,
  onRemoveCartItem,
  onUpdateActiveItemQty,
  onRemoveActiveItem,
  onConfirmNewItems,
  onFinish,
  onPayPix,
  isPixLoading = false,
  isManualLoading = false,
  isConfirmingNewItems = false,
  isUpdatingOrder = false,
}) => {
  const activeOrderTotal = activeOrderItems.reduce((acc, item) => {
    const price = Number(item.unitPrice ?? item.product?.price ?? 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  const cartTotal = cartItems.reduce((acc, item) => {
    const price = Number(item.product?.price ?? 0);
    return acc + price * (item.qty || 1);
  }, 0);

  const grandTotal = activeOrderTotal + cartTotal;

  const debitoFee = 0.0125;
  const creditoFee = 0.0311;

  const totalDebito = grandTotal * (1 + debitoFee);
  const totalCredito = grandTotal * (1 + creditoFee);
  const totalPix = grandTotal;

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const hasAnyItems = activeOrderItems.length > 0 || cartItems.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          color: 'black',
          fontSize: '1.15rem',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <span>
          {tableNumber ? `Mesa ${tableNumber} • Comanda & Carrinho` : 'Carrinho / Checkout'}
        </span>
        {activeOrder && (
          <Chip
            size="small"
            label="Comanda Aberta"
            color="warning"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {!hasAnyItems ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary" gutterBottom>
              Seu carrinho está vazio e esta mesa não possui comanda aberta.
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Selecione itens do cardápio para adicionar ao pedido.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* SEÇÃO 1: ITENS JÁ LANÇADOS NA COMANDA */}
            {activeOrderItems.length > 0 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptLongIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Itens Lançados na Comanda
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Subtotal: <strong>{formatCurrency(activeOrderTotal)}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {activeOrderItems.map((item) => {
                    const price = Number(item.unitPrice ?? item.product?.price ?? 0);
                    const itemSubtotal = price * item.quantity;
                    const name = item.productName || item.product?.name || 'Item do Pedido';

                    return (
                      <Box
                        key={item.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'grey.50',
                          border: '1px solid',
                          borderColor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, wordBreak: 'break-word' }}
                          >
                            {name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatCurrency(price)} cada
                          </Typography>
                          {item.notes && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: 'block', fontStyle: 'italic' }}
                            >
                              Obs: {item.notes}
                            </Typography>
                          )}
                        </Box>

                        {/* Controles de quantidade e subtotal */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: 'white',
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateActiveItemQty(item.id, item.quantity - 1);
                                } else {
                                  onRemoveActiveItem(item.id);
                                }
                              }}
                              disabled={isUpdatingOrder}
                              sx={{ p: 0.5 }}
                              title={item.quantity === 1 ? 'Remover item' : 'Diminuir quantidade'}
                            >
                              {item.quantity === 1 ? (
                                <DeleteIcon fontSize="small" color="error" />
                              ) : (
                                <RemoveIcon fontSize="small" />
                              )}
                            </IconButton>

                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 28,
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.quantity}
                            </Typography>

                            <IconButton
                              size="small"
                              onClick={() => onUpdateActiveItemQty(item.id, item.quantity + 1)}
                              disabled={isUpdatingOrder}
                              sx={{ p: 0.5 }}
                              title="Aumentar quantidade"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 70,
                              textAlign: 'right',
                            }}
                          >
                            {formatCurrency(itemSubtotal)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* SEÇÃO 2: NOVOS ITENS ADICIONADOS AO CARRINHO (PENDENTES) */}
            {cartItems.length > 0 && (
              <Box>
                {activeOrderItems.length > 0 && <Divider sx={{ my: 1 }} />}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddShoppingCartIcon color="success" fontSize="small" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Novos Itens a Adicionar
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Subtotal: <strong>{formatCurrency(cartTotal)}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {cartItems.map((item, idx) => {
                    const price = Number(item.product?.price ?? 0);
                    const itemSubtotal = price * item.qty;
                    const name = item.product?.name || 'Novo Produto';

                    return (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'success.50',
                          border: '1px solid',
                          borderColor: 'success.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, wordBreak: 'break-word' }}
                          >
                            {name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {formatCurrency(price)} cada
                          </Typography>
                          {item.observations && (
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ display: 'block', fontStyle: 'italic' }}
                            >
                              Obs: {item.observations}
                            </Typography>
                          )}
                        </Box>

                        {/* Controles de quantidade e subtotal */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              bgcolor: 'white',
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 1.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (item.qty > 1) {
                                  onUpdateCartItemQty(idx, item.qty - 1);
                                } else {
                                  onRemoveCartItem(idx);
                                }
                              }}
                              sx={{ p: 0.5 }}
                              title={item.qty === 1 ? 'Remover item' : 'Diminuir quantidade'}
                            >
                              {item.qty === 1 ? (
                                <DeleteIcon fontSize="small" color="error" />
                              ) : (
                                <RemoveIcon fontSize="small" />
                              )}
                            </IconButton>

                            <Typography
                              variant="body2"
                              sx={{
                                minWidth: 28,
                                textAlign: 'center',
                                fontWeight: 'bold',
                              }}
                            >
                              {item.qty}
                            </Typography>

                            <IconButton
                              size="small"
                              onClick={() => onUpdateCartItemQty(idx, item.qty + 1)}
                              sx={{ p: 0.5 }}
                              title="Aumentar quantidade"
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 70,
                              textAlign: 'right',
                            }}
                          >
                            {formatCurrency(itemSubtotal)}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {onConfirmNewItems && (
                  <Button
                    onClick={onConfirmNewItems}
                    variant="outlined"
                    color="success"
                    startIcon={isConfirmingNewItems ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                    disabled={isConfirmingNewItems || isPixLoading || isManualLoading}
                    fullWidth
                    size="small"
                    sx={{ mt: 1.5, fontWeight: 'bold', textTransform: 'none' }}
                  >
                    {activeOrder
                      ? 'Lançar Novos Itens na Comanda Aberta'
                      : 'Confirmar Pedido na Mesa (Abrir Comanda)'}
                  </Button>
                )}
              </Box>
            )}

            {/* SEÇÃO 3: RESUMO GERAL E SIMULAÇÃO DE PAGAMENTO */}
            <Divider sx={{ my: 0.5 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} gutterBottom>
                Resumo do Pedido
              </Typography>

              {activeOrderItems.length > 0 && cartItems.length > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Comanda atual:
                    </Typography>
                    <Typography variant="body2">{formatCurrency(activeOrderTotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      Novos itens no carrinho:
                    </Typography>
                    <Typography variant="body2">{formatCurrency(cartTotal)}</Typography>
                  </Box>
                </>
              )}

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'grey.100',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Total a Pagar:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {formatCurrency(grandTotal)}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                  Simulação de Formas de Pagamento:
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    Débito (+1,25%):
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatCurrency(totalDebito)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    Crédito à Vista (+3,11%):
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {formatCurrency(totalCredito)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="textSecondary">
                    Pix (Sem taxa):
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {formatCurrency(totalPix)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" icon={<QrCode2Icon />} sx={{ mt: 2, borderRadius: 2 }}>
                Ao escolher <strong>Pagar com Pix</strong>, você receberá um QR Code dinâmico do{' '}
                <strong>Mercado Pago</strong> com 10 minutos de validade e confirmação automática.
              </Alert>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} color="inherit" size="small" sx={{ textTransform: 'none' }}>
          Continuar comprando
        </Button>

        <Button
          onClick={onFinish}
          variant="outlined"
          color="inherit"
          disabled={!hasAnyItems || isManualLoading || isPixLoading || isConfirmingNewItems || isUpdatingOrder}
          startIcon={isManualLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
          size="small"
          sx={{ textTransform: 'none' }}
        >
          Dar baixa manual
        </Button>

        {onPayPix && (
          <Button
            onClick={onPayPix}
            variant="contained"
            color="primary"
            startIcon={(isPixLoading || isUpdatingOrder) ? <CircularProgress size={16} color="inherit" /> : <QrCode2Icon />}
            disabled={!hasAnyItems || isPixLoading || isManualLoading || isConfirmingNewItems || isUpdatingOrder}
            size="small"
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          >
            Pagar com Pix (Mercado Pago)
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
