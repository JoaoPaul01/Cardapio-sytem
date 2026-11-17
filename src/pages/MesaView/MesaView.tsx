import { useCallback, useEffect, useState, useRef } from 'react';
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
import { CheckoutDialog, type CartItem } from './components/CheckoutDialog';
import { PixPaymentDialog } from '../../components/PixPayment/PixPaymentDialog';
import styles from './MesaView.module.css';

export default function MesaView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getData, postData, putData, patchData, removeData } = useAppContext();

  const [categories, setCategories] = useState<any[]>([]);
  const [mesa, setMesa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filterText, setFilterText] = useState('');

  // Cart state persisted per table in localStorage
  const cartStorageKey = id ? `cardapio_cart_mesa_${id}` : '';
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (!id) return [];
    try {
      const saved = localStorage.getItem(`cardapio_cart_mesa_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dialogs state
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isProductDialogOpen, setProductDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isPixDialogOpen, setPixDialogOpen] = useState(false);
  const [pixOrderId, setPixOrderId] = useState<string | null>(null);
  const [isPixLoading, setIsPixLoading] = useState(false);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [isConfirmingNewItems, setIsConfirmingNewItems] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Sincroniza cartItems com localStorage
  useEffect(() => {
    if (cartStorageKey) {
      if (cartItems.length > 0) {
        localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(cartStorageKey);
      }
    }
  }, [cartItems, cartStorageKey]);

  // Recarrega itens do carrinho caso o id da mesa mude
  useEffect(() => {
    if (id) {
      try {
        const saved = localStorage.getItem(`cardapio_cart_mesa_${id}`);
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
    }
  }, [id]);

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
    setCartItems(prev => {
      const existingIdx = prev.findIndex(
        item => item.product?.id === product.id && item.observations === (observations || '')
      );
      if (existingIdx >= 0 && prev[existingIdx]) {
        const updated = [...prev];
        const existing = prev[existingIdx]!;
        updated[existingIdx] = {
          product: existing.product,
          observations: existing.observations,
          qty: existing.qty + qty,
        };
        return updated;
      }
      return [...prev, { product, qty, observations }];
    });

    handleCloseProductDialog();
    if (goToCart) {
      setCheckoutDialogOpen(true);
    }
  };

  const handleUpdateCartItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems(prev => {
      const existing = prev[index];
      if (!existing) return prev;
      const updated = [...prev];
      updated[index] = {
        product: existing.product,
        observations: existing.observations,
        qty: newQty,
      };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Remove item já lançado no banco
  const handleRemoveActiveItem = async (itemId: string) => {
    if (!mesa?.activeOrder) return;
    const confirm = window.confirm('Deseja realmente remover este item da comanda?');
    if (!confirm) return;

    setIsUpdatingOrder(true);
    try {
      await removeData(`${locations.orders}/${mesa.activeOrder.id}/items/${itemId}`);
      await fetchData(true);
    } catch (error: any) {
      console.error('Erro ao remover item da comanda', error);
      alert(error?.response?.data?.error || 'Erro ao remover item da comanda.');
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Atualiza quantidade de item já lançado no banco com indicador de carregamento
  const handleUpdateActiveItemQty = async (itemId: string, newQty: number) => {
    if (!mesa?.activeOrder) return;
    if (newQty <= 0) {
      handleRemoveActiveItem(itemId);
      return;
    }

    setIsUpdatingOrder(true);
    try {
      await putData(`${locations.orders}/${mesa.activeOrder.id}/items/${itemId}`, {
        quantity: newQty,
      });
      await fetchData(true);
    } catch (error: any) {
      console.error('Erro ao atualizar quantidade do item na comanda', error);
      alert(error?.response?.data?.error || 'Erro ao atualizar quantidade do item.');
      await fetchData(true);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Lança novos itens na comanda sem fechar a conta
  const handleConfirmNewItems = async () => {
    if (cartItems.length === 0 || !mesa) return;

    setIsConfirmingNewItems(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.qty,
        notes: item.observations || '',
      }));

      if (mesa.activeOrder) {
        await postData(`${locations.orders}/${mesa.activeOrder.id}/items`, {
          items: itemsPayload,
        });
      } else {
        await postData(locations.orders, {
          tableId: mesa.id,
          items: itemsPayload,
        });
      }

      setCartItems([]);
      if (cartStorageKey) localStorage.removeItem(cartStorageKey);
      await fetchData(true);
    } catch (error: any) {
      console.error('Erro ao lançar itens na comanda', error);
      alert(error?.response?.data?.error || 'Erro ao lançar itens na comanda.');
    } finally {
      setIsConfirmingNewItems(false);
    }
  };

  // Dar baixa manual e fechar comanda
  const handleFinishCheckout = async () => {
    if (!mesa) return;
    const hasActive = !!mesa.activeOrder;
    const hasCart = cartItems.length > 0;
    if (!hasActive && !hasCart) return;

    setIsManualLoading(true);
    setLoadError('');
    try {
      let orderId = mesa.activeOrder?.id;

      if (hasCart) {
        const itemsPayload = cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.qty,
          notes: item.observations || '',
        }));

        if (hasActive) {
          await postData(`${locations.orders}/${orderId}/items`, { items: itemsPayload });
        } else {
          const newOrder = await postData(locations.orders, {
            tableId: mesa.id,
            items: itemsPayload,
          });
          orderId = newOrder.id;
        }
        setCartItems([]);
        if (cartStorageKey) localStorage.removeItem(cartStorageKey);
      }

      if (orderId) {
        await patchData(`${locations.orders}/${orderId}/status`, { status: 'CLOSED' });
      }

      setCheckoutDialogOpen(false);
      setSuccessDialogOpen(true);
      setTimeout(() => {
        setSuccessDialogOpen(false);
        navigate('/mesas');
      }, 2500);
    } catch (error: any) {
      console.error('Erro ao finalizar pedido', error);
      alert(error?.response?.data?.error || 'Erro ao finalizar o pedido.');
    } finally {
      setIsManualLoading(false);
    }
  };

  // Pagar via Pix (Mercado Pago)
  const handlePayWithPix = async () => {
    if (!mesa) return;
    const hasActive = !!mesa.activeOrder;
    const hasCart = cartItems.length > 0;
    if (!hasActive && !hasCart) return;

    setIsPixLoading(true);
    setLoadError('');
    try {
      let orderId = mesa.activeOrder?.id;

      if (hasCart) {
        const itemsPayload = cartItems.map(item => ({
          productId: item.product.id,
          quantity: item.qty,
          notes: item.observations || '',
        }));

        if (hasActive) {
          await postData(`${locations.orders}/${orderId}/items`, { items: itemsPayload });
        } else {
          const newOrder = await postData(locations.orders, {
            tableId: mesa.id,
            items: itemsPayload,
          });
          orderId = newOrder.id;
        }
        setCartItems([]);
        if (cartStorageKey) localStorage.removeItem(cartStorageKey);
        await fetchData(true);
      }

      setCheckoutDialogOpen(false);
      setPixOrderId(orderId);
      setPixDialogOpen(true);
    } catch (error: any) {
      console.error('Erro ao preparar pagamento Pix', error);
      alert(error?.response?.data?.error || 'Erro ao preparar pagamento Pix.');
    } finally {
      setIsPixLoading(false);
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

  // Cálculo preciso do total da comanda ativa (fallback para os itens caso totalAmount venha vazio)
  const activeOrderTotal = mesa?.activeOrder?.totalAmount
    ? Number(mesa.activeOrder.totalAmount)
    : (mesa?.activeOrder?.items || []).reduce((acc: number, item: any) => {
        const price = Number(item.unitPrice || item.product?.price || 0);
        return acc + price * (item.quantity || 1);
      }, 0);

  const activeOrderItemsCount = (mesa?.activeOrder?.items || []).reduce(
    (acc: number, item: any) => acc + (item.quantity || 1),
    0
  );
  const cartPendingItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalCartBadgeCount = activeOrderItemsCount + cartPendingItemsCount;

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
              <Badge badgeContent={totalCartBadgeCount} color="error">
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
                    {activeOrderTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={styles.pixBannerBtn}
                  onClick={() => setCheckoutDialogOpen(true)}
                  style={{ background: '#475569' }}
                >
                  Ver Comanda
                </button>
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
        tableNumber={mesa?.tableNumber}
        activeOrder={mesa?.activeOrder}
        activeOrderItems={mesa?.activeOrder?.items || []}
        cartItems={cartItems}
        onClose={() => setCheckoutDialogOpen(false)}
        onUpdateCartItemQty={handleUpdateCartItemQty}
        onRemoveCartItem={handleRemoveCartItem}
        onUpdateActiveItemQty={handleUpdateActiveItemQty}
        onRemoveActiveItem={handleRemoveActiveItem}
        onConfirmNewItems={cartItems.length > 0 ? handleConfirmNewItems : undefined}
        onFinish={handleFinishCheckout}
        onPayPix={handlePayWithPix}
        isPixLoading={isPixLoading}
        isManualLoading={isManualLoading}
        isConfirmingNewItems={isConfirmingNewItems}
        isUpdatingOrder={isUpdatingOrder}
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
