import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Badge,
  CircularProgress,
  Alert,
  Dialog,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCode2Icon from '@mui/icons-material/QrCode2';

import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { ProductDialog } from './components/ProductDialog';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PixPaymentDialog } from '../../components/PixPayment/PixPaymentDialog';

interface CartItem {
  product: any;
  qty: number;
  observations: string;
}

export default function MesaView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Uma única chamada do contexto, com tudo o que o componente precisa
  const { getData, postData, patchData } = useAppContext();

  const [categories, setCategories] = useState<any[]>([]);
  const [mesa, setMesa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filterText, setFilterText] = useState('');

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Dialogs state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isPixDialogOpen, setPixDialogOpen] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const [categoriesData, mesaData] = await Promise.all([
        getData(locations.categories),
        id ? getData(`${locations.tables}/${id}`) : Promise.resolve(null),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setMesa(mesaData);
    } catch (error: any) {
      console.error('Erro ao carregar dados da mesa', error);
      setLoadError(error?.response?.data?.error || 'Não foi possível carregar o cardápio.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [getData, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const scrollToCategory = (categoryId: string) => {
    document.getElementById(`cat-${categoryId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenProductDialog = (product: any) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleCloseProductDialog = () => {
    setProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: any, qty: number, observations: string, goToCart: boolean) => {
    setCartItems(prev => [...prev, { product, qty, observations }]);
    handleCloseProductDialog();
    if (goToCart) {
      setCheckoutDialogOpen(true);
    }
  };

  const handleFinishCheckout = async () => {
    if (cartItems.length === 0 || !mesa) return;

    setLoading(true);
    setLoadError('');
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.qty,
        notes: item.observations || ''
      }));

      // Cria a comanda para a mesa
      const newOrder = await postData(locations.orders, {
        tableId: mesa.id,
        items: itemsPayload
      });

      // Atualiza o status para CLOSED
      await patchData(`${locations.orders}/${newOrder.id}/status`, { status: 'CLOSED' });

      setCartItems([]);
      setCheckoutDialogOpen(false);

      // Exibe a animação
      setSuccessDialogOpen(true);
      setTimeout(() => {
        setSuccessDialogOpen(false);
        navigate('/mesas');
      }, 2500);
    } catch (error: any) {
      console.error('Erro ao finalizar pedido', error);
      alert(error?.response?.data?.error || 'Erro ao finalizar o pedido. Verifique se a mesa já possui uma comanda aberta.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithPix = async () => {
    if (!mesa) return;

    // Se a mesa já possui comanda aberta
    if (mesa.activeOrder) {
      setLoading(true);
      try {
        if (cartItems.length > 0) {
          const itemsPayload = cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.qty,
            notes: item.observations || ''
          }));
          await postData(`${locations.orders}/${mesa.activeOrder.id}/items`, { items: itemsPayload });
          setCartItems([]);
        }
        setCheckoutDialogOpen(false);
        setPixOrderId(mesa.activeOrder.id);
        setPixDialogOpen(true);
      } catch (error: any) {
        console.error('Erro ao adicionar itens e gerar Pix', error);
        alert(error?.response?.data?.error || 'Erro ao preparar pagamento Pix.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (cartItems.length === 0) return;

    setLoading(true);
    setLoadError('');
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.qty,
        notes: item.observations || ''
      }));

      const newOrder = await postData(locations.orders, {
        tableId: mesa.id,
        items: itemsPayload
      });

      setCartItems([]);
      setCheckoutDialogOpen(false);
      setPixOrderId(newOrder.id);
      setPixDialogOpen(true);
    } catch (error: any) {
      console.error('Erro ao abrir comanda para pagamento Pix', error);
      alert(error?.response?.data?.error || 'Erro ao processar pedido.');
    } finally {
      setLoading(false);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Filtra categorias e produtos ativos para exibição no cardápio do cliente
  const filteredCategories = categories
    .filter(cat => cat.isActive !== false) // Oculta categorias pausadas
    .map(cat => {
      const products = (cat.products || []).filter((p: any) => p.isActive !== false); // Oculta produtos pausados
      const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(filterText.toLowerCase()) ||
        cat.name.toLowerCase().includes(filterText.toLowerCase())
      );
      return { ...cat, products: filteredProducts };
    }).filter(cat => {
      // text filter
      const matchesText = cat.name.toLowerCase().includes(filterText.toLowerCase()) || (cat.products && cat.products.length > 0);
      // category selection filter
      const matchesCategory = selectedCategory === 'ALL' || cat.id === selectedCategory;
      
      return matchesText && matchesCategory;
    });

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box sx={{
        width: 250,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderRight: '1px solid #ddd',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        </Box>
        <Box sx={{ p: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            fullWidth
            variant="text"
            sx={{ justifyContent: 'flex-start', mb: 2 }}
          >
            Início
          </Button>
          <Typography variant="overline" color="textSecondary" sx={{ px: 2 }}>
            CATEGORIAS
          </Typography>
          <List>
            {categories.map((cat, idx) => (
              <ListItem disablePadding key={cat.id || idx}>
                <ListItemButton onClick={() => scrollToCategory(cat.id)} sx={{ borderRadius: 1 }}>
                  <ListItemText primary={cat.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2,
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} 
              onClick={() => navigate('/')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {mesa ? `Mesa ${mesa.tableNumber}` : 'Mesa'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <TextField
              size="small"
              placeholder="O que deseja pedir?"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 150 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={
                <Badge badgeContent={cartTotalItems} color="error">
                  <ShoppingCartIcon />
                </Badge>
              }
              onClick={() => setCheckoutDialogOpen(true)}
              sx={{ borderRadius: 5, whiteSpace: 'nowrap' }}
            >
              Carrinho
            </Button>
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* Banner de Comanda Aberta */}
          {mesa?.activeOrder && (
            <Alert
              severity="warning"
              icon={<QrCode2Icon />}
              action={
                <Button
                  color="inherit"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                  onClick={() => {
                    setPixOrderId(mesa.activeOrder.id);
                    setPixDialogOpen(true);
                  }}
                >
                  Pagar via Pix (Mercado Pago)
                </Button>
              }
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Esta mesa possui comanda aberta no valor de{' '}
              <strong>
                {Number(mesa.activeOrder.totalAmount || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </strong>
            </Alert>
          )}

          {/* Category Selector */}
          {!loading && !loadError && categories.length > 0 && (
            <Box sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 2,
              mb: 4,
              pb: 1,
              '&::-webkit-scrollbar': { height: 6 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#ccc', borderRadius: 3 }
            }}>
              <Button
                variant={selectedCategory === 'ALL' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('ALL')}
                sx={{ borderRadius: 20, whiteSpace: 'nowrap', textTransform: 'none', px: 3, flexShrink: 0 }}
              >
                Ver todos
              </Button>
              {categories.map((cat, idx) => (
                <Button
                  key={cat.id || idx}
                  variant={selectedCategory === cat.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(cat.id)}
                  sx={{ borderRadius: 20, whiteSpace: 'nowrap', textTransform: 'none', px: 3, flexShrink: 0 }}
                >
                  {cat.name}
                </Button>
              ))}
            </Box>
          )}

          {loadError && (
            <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" onClick={() => fetchData()}>Tentar novamente</Button>}>
              {loadError}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && !loadError && filteredCategories.length === 0 && (
            <Typography color="textSecondary" sx={{ textAlign: 'center' }}>
              Nenhuma categoria/produto encontrado.
            </Typography>
          )}

          {/* Catalog */}
          {!loading && filteredCategories.map((category, idx) => (
            <Box key={category.id || idx} id={`cat-${category.id}`} sx={{ mb: 4, scrollMarginTop: 16 }}>
              <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
                {category.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {category.products.map((product: any, pIdx: number) => (
                  <Card key={product.id || pIdx} sx={{ width: 380, maxWidth: '100%', borderRadius: 2 }}>
                    <CardActionArea 
                      onClick={() => handleOpenProductDialog(product)} 
                      sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 1.5, justifyContent: 'flex-start' }}
                    >
                      {/* Imagem do produto à esquerda */}
                      {product.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={product.imageUrl}
                          alt={product.name}
                          sx={{ width: { xs: 75, sm: 85 }, height: { xs: 75, sm: 85 }, minWidth: { xs: 75, sm: 85 }, objectFit: 'cover', borderRadius: 2 }}
                          onError={(e: any) => {
                            e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%239e9e9e"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                          }}
                        />
                      ) : (
                        <Box sx={{
                          width: { xs: 75, sm: 85 },
                          height: { xs: 75, sm: 85 },
                          minWidth: { xs: 75, sm: 85 },
                          backgroundColor: '#f0f0f0',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#9e9e9e',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          Sem Foto
                        </Box>
                      )}

                      <CardContent sx={{ flex: 1, minWidth: 0, p: 0, '&:last-child': { pb: 0 } }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 18, fontSize: { xs: '0.8rem', sm: '0.85rem' }
                        }}>
                          {product.description || 'Sem descrição'}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 0.5, fontWeight: 'bold', fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                          {Number(product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
                {category.products.length === 0 && (
                  <Typography variant="body2" color="textSecondary">
                    Nenhum produto nesta categoria.
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Dialogs */}
      <ProductDialog
        open={isProductDialogOpen}
        product={selectedProduct}
        onClose={handleCloseProductDialog}
        onAdd={handleAddToCart}
      />

      <CheckoutDialog
        open={isCheckoutDialogOpen}
        cartItems={cartItems}
        onClose={() => setCheckoutDialogOpen(false)}
        onFinish={handleFinishCheckout}
        onPayPix={handlePayWithPix}
      />

      <PixPaymentDialog
        open={isPixDialogOpen}
        orderId={pixOrderId}
        onClose={() => setPixDialogOpen(false)}
        onSuccess={() => {
          setPixDialogOpen(false);
          fetchData(true);
          setSuccessDialogOpen(true);
          setTimeout(() => {
            setSuccessDialogOpen(false);
            navigate('/mesas');
          }, 2500);
        }}
      />

      {/* Success Dialog (Animation) */}
      <Dialog open={isSuccessDialogOpen} sx={{ '& .MuiDialog-paper': { backgroundColor: 'transparent', boxShadow: 'none' } }}>
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.9)', borderRadius: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 2, animation: 'pulse 1.5s infinite' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 1 }}>
            Mesa Fechada!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Pagamento recebido com sucesso.
          </Typography>
          <style>
            {`
              @keyframes pulse {
                0% { transform: scale(0.9); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(0.9); opacity: 0.8; }
              }
            `}
          </style>
        </Box>
      </Dialog>
    </Box>
  );
}