import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, CircularProgress, Alert, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, InputAdornment, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { PixPaymentDialog } from '../../components/PixPayment/PixPaymentDialog';

const statusLabels: Record<string, { label: string; color: any }> = {
  OPEN: { label: 'EM ABERTO', color: 'info' },
  CLOSED: { label: 'FECHADO', color: 'success' },
  PAID: { label: 'PAGO', color: 'success' },
  CANCELED: { label: 'CANCELADO', color: 'error' },
  BILL_REQUESTED: { label: 'CONTA PEDIDA', color: 'warning' },
};

export default function Historico() {
  const { getData } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filterText, setFilterText] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPixDialog, setOpenPixDialog] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getData(locations.orders);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Não foi possível carregar o histórico de pedidos.');
    } finally {
      setLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetails = (order: any) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
    setOpenDialog(false);
  };

  const filteredOrders = orders.filter(order => {
    const searchStr = filterText.toLowerCase();
    return (
      (order.id || '').toLowerCase().includes(searchStr) ||
      (order.customerName || '').toLowerCase().includes(searchStr) ||
      (`mesa ${order.tableNumber}`).includes(searchStr)
    );
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Histórico de Pedidos
        </Typography>

        <Paper sx={{ p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <TextField
            size="small"
            placeholder="Pesquisar por Nº do pedido ou mesa..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }
            }}
          />
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Versão Mobile: Cards com visual moderno e compacto */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 1.5 }}>
              {filteredOrders.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">Nenhum pedido encontrado.</Typography>
                </Paper>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = statusLabels[order.status] || { label: order.status, color: 'default' };
                  return (
                    <Paper 
                      key={order.id} 
                      elevation={2} 
                      sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1 }}
                      onClick={() => handleOpenDetails(order)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.95rem' }}>
                          Mesa {order.tableNumber}
                        </Typography>
                        <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight: 600, height: 22, fontSize: '0.75rem' }} />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          #{order.id.slice(0, 8).toUpperCase()} {order.customerName ? `• ${order.customerName}` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 0.5 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'text.primary' }}>
                          R$ {Number(order.totalAmount || 0).toFixed(2).replace('.', ',')}
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          endIcon={<VisibilityIcon fontSize="small" />}
                          onClick={(e) => { e.stopPropagation(); handleOpenDetails(order); }}
                          sx={{ textTransform: 'none', py: 0.2, px: 1, fontSize: '0.75rem' }}
                        >
                          Ver Detalhes
                        </Button>
                      </Box>
                    </Paper>
                  );
                })
              )}
            </Box>

            {/* Versão Desktop / Tablet: Tabela Clássica com overflow suave */}
            <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>PEDIDO</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>MESA</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>CLIENTE</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>DATA/HORÁRIO</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>TOTAL</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">AÇÕES</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => {
                      const statusInfo = statusLabels[order.status] || { label: order.status, color: 'default' };
                      return (
                        <TableRow key={order.id} hover>
                          <TableCell>{order.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell>Mesa {order.tableNumber}</TableCell>
                          <TableCell>{order.customerName || '-'}</TableCell>
                          <TableCell>
                            <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                          </TableCell>
                          <TableCell>{new Date(order.createdAt).toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            R$ {Number(order.totalAmount || 0).toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleOpenDetails(order)} size="small" color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Detalhes do Pedido Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: 'black' }}>Detalhes do Pedido</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Mesa</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Mesa {selectedOrder.tableNumber}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Data/Horário</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Status</Typography>
                  <Chip 
                    label={statusLabels[selectedOrder.status]?.label || selectedOrder.status} 
                    color={statusLabels[selectedOrder.status]?.color || 'default'} 
                    size="small" 
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="body2" color="textSecondary">Total</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    R$ {Number(selectedOrder.totalAmount || 0).toFixed(2).replace('.', ',')}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>Itens ({selectedOrder.totalItems})</Typography>
              {selectedOrder.items?.map((item: any) => (
                <Box key={item.id} sx={{ mb: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 'bold' }}>{item.quantity}x {item.productName}</Typography>
                    <Typography>R$ {Number(item.subtotal || 0).toFixed(2).replace('.', ',')}</Typography>
                  </Box>
                  {item.notes && (
                    <Typography variant="body2" color="textSecondary">
                      Obs: {item.notes}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleCloseDetails} color="inherit">
            Fechar
          </Button>
          {selectedOrder && selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELED' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<QrCode2Icon />}
              onClick={() => {
                setPixOrderId(selectedOrder.id);
                setOpenPixDialog(true);
              }}
              sx={{ fontWeight: 'bold' }}
            >
              Pagar via Pix (Mercado Pago)
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <PixPaymentDialog
        open={openPixDialog}
        orderId={pixOrderId}
        onClose={() => setOpenPixDialog(false)}
        onSuccess={() => {
          fetchOrders();
          setOpenDialog(false);
        }}
      />
    </Box>
  );
}
