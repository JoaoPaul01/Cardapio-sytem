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
  Dialog
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { ProductDialog } from './components/ProductDialog';
import { CheckoutDialog } from './components/CheckoutDialog';

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

  const fetchData = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
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
        navigate('/historico');
      }, 2500);
    } catch (error: any) {
      console.error('Erro ao finalizar pedido', error);
      alert(error?.response?.data?.error || 'Erro ao finalizar o pedido. Verifique se a mesa já possui uma comanda aberta.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.map(cat => {
    const products = cat.products || [];
    const filteredProducts = products.filter((p: any) =>
      p.name.toLowerCase().includes(filterText.toLowerCase()) ||
      cat.name.toLowerCase().includes(filterText.toLowerCase())
    );
    return { ...cat, products: filteredProducts };
  }).filter(cat =>
    cat.name.toLowerCase().includes(filterText.toLowerCase()) ||
    (cat.products && cat.products.length > 0)
  );

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box sx={{
        width: 250,
        flexShrink: 0,
        bgcolor: '#ffffff',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}>
        <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid #ddd' }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>we do</Typography>
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
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6">
            {mesa ? `Mesa ${mesa.tableNumber}` : 'Mesa'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="O que deseja pedir?"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
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
              sx={{ borderRadius: 5 }}
            >
              Carrinho
            </Button>
          </Box>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          {/* Banner */}
          <Box sx={{
            width: '100%',
            height: 200,
            borderRadius: 2,
            mb: 4,
            background: 'linear-gradient(135deg, #1e1e2d 0%, #3a3a5a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#fff' }}>Cardápio</Typography>
          </Box>

          {loadError && (
            <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" onClick={fetchData}>Tentar novamente</Button>}>
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
                  <Card
                    key={product.id || pIdx}
                    sx={{ width: 380, maxWidth: '100%' }}
                  >
                    <CardActionArea onClick={() => handleOpenProductDialog(product)} sx={{ display: 'flex', alignItems: 'stretch', justifyContent: 'space-between' }}>
                      <CardContent sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                        }}>
                          {product.description || 'Sem descrição'}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                          {Number(product.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </Typography>
                      </CardContent>
                      {product.imageUrl && (
                        <CardMedia
                          component="img"
                          image={product.imageUrl}
                          alt={product.name}
                          sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, m: 1.5, alignSelf: 'center' }}
                        />
                      )}
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