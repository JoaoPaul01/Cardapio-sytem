import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Dialog } from '@mui/material';
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
import styles from './MesaView.module.css';

interface CartItem {
  product: any;
  qty: number;
  observations: string;
}

export default function MesaView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    .filter(cat => cat.isActive !== false)
    .map(cat => {
      const products = (cat.products || []).filter((p: any) => p.isActive !== false);
      const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(filterText.toLowerCase()) ||
        cat.name.toLowerCase().includes(filterText.toLowerCase())
      );
      return { ...cat, products: filteredProducts };
    }).filter(cat => {
      const matchesText = cat.name.toLowerCase().includes(filterText.toLowerCase()) || (cat.products && cat.products.length > 0);
      const matchesCategory = selectedCategory === 'ALL' || cat.id === selectedCategory;
      return matchesText && matchesCategory;
    });

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className={styles.page}>
      {/* Sidebar Desktop */}
      <aside className={styles.sidebar} aria-label="Categorias do cardápio">
        <button type="button" className={styles.backButton} onClick={() => navigate('/')}>
          <ArrowBackIcon fontSize="small" aria-hidden="true" />
          Início
        </button>

        <span className={styles.sidebarLabel}>Categorias</span>
        <ul className={styles.navList}>
          {categories.map((cat, idx) => (
            <li key={cat.id || idx}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => scrollToCategory(cat.id)}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.titleGroup}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => navigate('/')}
                aria-label="Voltar para mesas"
              >
                <ArrowBackIcon aria-hidden="true" />
              </button>
              <h1 className={styles.tableTitle}>
                {mesa ? `Mesa ${mesa.tableNumber}` : 'Mesa'}
              </h1>
            </div>
          </div>

          <div className={styles.controls}>
            <label htmlFor="mesa-search" className={styles.srOnly}>
              Buscar produto ou categoria
            </label>
            <div className={styles.searchWrap}>
              <SearchIcon aria-hidden="true" />
              <input
                id="mesa-search"
                type="search"
                className={styles.searchInput}
                placeholder="O que deseja pedir?"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={styles.cartButton}
              onClick={() => setCheckoutDialogOpen(true)}
            >
              <Badge badgeContent={cartTotalItems} color="error">
                <ShoppingCartIcon aria-hidden="true" />
              </Badge>
              <span>Carrinho</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className={styles.content}>
          {/* Banner de Comanda Aberta */}
          {mesa?.activeOrder && (
            <div className={styles.orderBanner} role="region" aria-label="Comanda aberta">
              <div className={styles.orderBannerInfo}>
                <QrCode2Icon className={styles.orderBannerIcon} aria-hidden="true" />
                <span>
                  Esta mesa possui comanda aberta no valor de{' '}
                  <strong className={styles.orderBannerAmount}>
                    {Number(mesa.activeOrder.totalAmount || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                className={styles.pixBannerBtn}
                onClick={() => {
                  setPixOrderId(mesa.activeOrder.id);
                  setPixDialogOpen(true);
                }}
              >
                Pagar via Pix (Mercado Pago)
              </button>
            </div>
          )}

          {/* Category Selector */}
          {!loading && !loadError && categories.length > 0 && (
            <div className={styles.pillsRow} role="tablist" aria-label="Filtrar por categoria">
              <button
                type="button"
                role="tab"
                aria-selected={selectedCategory === 'ALL'}
                className={`${styles.pill} ${selectedCategory === 'ALL' ? styles.pillActive : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                Ver todos
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={cat.id || idx}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === cat.id}
                  className={`${styles.pill} ${selectedCategory === cat.id ? styles.pillActive : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loadError && (
            <div className={styles.errorAlert} role="alert">
              <span>{loadError}</span>
              <button type="button" className={styles.retryBtn} onClick={() => fetchData()}>
                Tentar novamente
              </button>
            </div>
          )}

          {loading && (
            <div className={styles.stateBox} role="status" aria-live="polite">
              <div className={styles.spinner} aria-hidden="true" />
              <span>Carregando cardápio...</span>
            </div>
          )}

          {!loading && !loadError && filteredCategories.length === 0 && (
            <div className={styles.stateBox}>
              <p>Nenhuma categoria/produto encontrado.</p>
            </div>
          )}

          {/* Catalog */}
          {!loading && filteredCategories.map((category, idx) => (
            <section key={category.id || idx} id={`cat-${category.id}`} className={styles.categorySection}>
              <h2 className={styles.categoryTitle}>{category.name}</h2>
              <div className={styles.productGrid}>
                {category.products.map((product: any, pIdx: number) => (
                  <button
                    key={product.id || pIdx}
                    type="button"
                    className={styles.productCard}
                    onClick={() => handleOpenProductDialog(product)}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={styles.productImage}
                        onError={(e: any) => {
                          e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%239e9e9e"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
                        }}
                      />
                    ) : (
                      <div className={styles.noPhoto} aria-hidden="true">
                        Sem Foto
                      </div>
                    )}

                    <div className={styles.productBody}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productDesc}>
                        {product.description || 'Sem descrição'}
                      </p>
                      <span className={styles.productPrice}>
                        {Number(product.price || 0).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>
                  </button>
                ))}
                {category.products.length === 0 && (
                  <p className={styles.emptyCategory}>Nenhum produto nesta categoria.</p>
                )}
              </div>
            </section>
          ))}
        </main>
      </div>

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
      <Dialog open={isSuccessDialogOpen} slotProps={{ paper: { className: styles.successPaper } }}>
        <div className={styles.successBox}>
          <CheckCircleIcon className={styles.successIcon} aria-hidden="true" />
          <h2 className={styles.successTitle}>Mesa Fechada!</h2>
          <p className={styles.successText}>Pagamento recebido com sucesso.</p>
        </div>
      </Dialog>
    </div>
  );
}
