import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { PixPaymentDialog } from '../../components/PixPayment/PixPaymentDialog';
import styles from './Historico.module.css';

const statusLabels: Record<string, { label: string; color: any }> = {
  OPEN: { label: 'EM ABERTO', color: 'info' },
  CLOSED: { label: 'FECHADO', color: 'success' },
  PAID: { label: 'PAGO', color: 'success' },
  CANCELED: { label: 'CANCELADO', color: 'error' },
  BILL_REQUESTED: { label: 'CONTA PEDIDA', color: 'warning' },
};

export default function Historico() {
  const navigate = useNavigate();
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

  const renderStatusBadge = (status: string) => {
    const statusInfo = statusLabels[status] || { label: status, color: 'default' };
    const statusClass = styles[`status_${status}`] || styles.status_OPEN;
    return (
      <span className={`${styles.badge} ${statusClass}`}>
        <span className={styles.dot} aria-hidden="true" />
        {statusInfo.label}
      </span>
    );
  };

  return (
    <section className={styles.page} aria-labelledby="historico-title">
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <div>
            <h1 id="historico-title" className={styles.title}>Histórico de Pedidos</h1>
            <p className={styles.subtitle}>Consulte comandas abertas, fechadas e pagamentos realizados</p>
          </div>

          <div className={styles.navShortcuts}>
            <button
              type="button"
              className={styles.navShortcutBtn}
              onClick={() => navigate('/mesas')}
              title="Ir para o painel de Mesas"
            >
              <DashboardIcon fontSize="small" aria-hidden="true" />
              <span>Mesas</span>
            </button>
            <button
              type="button"
              className={styles.navShortcutBtn}
              onClick={() => navigate('/catalogo')}
              title="Ir para o Catálogo"
            >
              <MenuBookIcon fontSize="small" aria-hidden="true" />
              <span>Catálogo</span>
            </button>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <SearchIcon aria-hidden="true" />
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Pesquisar por Nº do pedido ou mesa..."
              aria-label="Pesquisar por número do pedido ou mesa"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorAlert} role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.stateBox} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Carregando histórico...</span>
        </div>
      ) : (
        <>
          {/* Versão Mobile */}
          <div className={styles.mobileList}>
            {filteredOrders.length === 0 ? (
              <div className={styles.stateBox}>
                <p>Nenhum pedido encontrado.</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className={styles.mobileCard}
                  onClick={() => handleOpenDetails(order)}
                >
                  <div className={styles.mobileRow}>
                    {order.tableId ? (
                      <button
                        type="button"
                        className={styles.mobileTableBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mesa/${order.tableId}`);
                        }}
                        title={`Ir para comanda da Mesa ${order.tableNumber}`}
                      >
                        Mesa {order.tableNumber} →
                      </button>
                    ) : (
                      <span className={styles.mobileTable}>Mesa {order.tableNumber}</span>
                    )}
                    {renderStatusBadge(order.status)}
                  </div>

                  <div className={styles.mobileRow}>
                    <span className={styles.mobileMeta}>
                      #{order.id.slice(0, 8).toUpperCase()}{' '}
                      {order.customerName ? `• ${order.customerName}` : ''}
                    </span>
                    <span className={styles.mobileMeta}>
                      {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      - {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <hr className={styles.mobileDivider} />

                  <div className={styles.mobileRow}>
                    <span className={styles.mobileTotal}>
                      R$ {Number(order.totalAmount || 0).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      type="button"
                      className={styles.detailsBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(order);
                      }}
                    >
                      Ver Detalhes
                      <VisibilityIcon fontSize="small" aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          {/* Versão Desktop / Tablet */}
          <TableContainer className={styles.tableContainer}>
            <Table>
              <TableHead className={styles.tableHead}>
                <TableRow>
                  <TableCell className={styles.th}>PEDIDO</TableCell>
                  <TableCell className={styles.th}>MESA</TableCell>
                  <TableCell className={styles.th}>CLIENTE</TableCell>
                  <TableCell className={styles.th}>STATUS</TableCell>
                  <TableCell className={styles.th}>DATA/HORÁRIO</TableCell>
                  <TableCell className={styles.th}>TOTAL</TableCell>
                  <TableCell className={styles.th} align="center">AÇÕES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" className={styles.td}>
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className={styles.tr}>
                      <TableCell className={`${styles.td} ${styles.tdCode}`}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell className={styles.td}>
                        {order.tableId ? (
                          <button
                            type="button"
                            className={styles.tableLinkBtn}
                            onClick={() => navigate(`/mesa/${order.tableId}`)}
                            title={`Abrir comanda da Mesa ${order.tableNumber}`}
                          >
                            Mesa {order.tableNumber}
                          </button>
                        ) : (
                          `Mesa ${order.tableNumber}`
                        )}
                      </TableCell>
                      <TableCell className={styles.td}>{order.customerName || '-'}</TableCell>
                      <TableCell className={styles.td}>
                        {renderStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className={styles.td}>
                        {new Date(order.createdAt).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className={`${styles.td} ${styles.tdPrice}`}>
                        R$ {Number(order.totalAmount || 0).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell className={styles.td} align="center">
                        <button
                          type="button"
                          className={styles.viewIconBtn}
                          onClick={() => handleOpenDetails(order)}
                          aria-label={`Ver detalhes do pedido da Mesa ${order.tableNumber}`}
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Detalhes do Pedido Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <h2 className={styles.dialogTitle}>Detalhes do Pedido</h2>
        <div className={styles.dialogBody}>
          {selectedOrder && (
            <>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Mesa</span>
                  <span className={styles.metaValue}>Mesa {selectedOrder.tableNumber}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Data/Horário</span>
                  <span className={styles.metaValue}>
                    {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Status</span>
                  <div>{renderStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Total</span>
                  <span className={styles.metaValue}>
                    R$ {Number(selectedOrder.totalAmount || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <h3 className={styles.itemsHeading}>Itens ({selectedOrder.totalItems})</h3>
              <div className={styles.itemsList}>
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className={styles.orderItemCard}>
                    <div className={styles.orderItemRow}>
                      <span>{item.quantity}x {item.productName}</span>
                      <span>R$ {Number(item.subtotal || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                    {item.notes && (
                      <div className={styles.orderItemNotes}>Obs: {item.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.ghostBtn} onClick={handleCloseDetails}>
            Fechar
          </button>
          {selectedOrder?.tableId && (
            <button
              type="button"
              className={styles.openTableBtn}
              onClick={() => {
                handleCloseDetails();
                navigate(`/mesa/${selectedOrder.tableId}`);
              }}
              title={`Ir para comanda da Mesa ${selectedOrder.tableNumber}`}
            >
              <TableRestaurantIcon fontSize="small" aria-hidden="true" />
              Ver Mesa {selectedOrder.tableNumber}
            </button>
          )}
          {selectedOrder && selectedOrder.status !== 'PAID' && selectedOrder.status !== 'CANCELED' && (
            <button
              type="button"
              className={styles.pixBtn}
              onClick={() => {
                setPixOrderId(selectedOrder.id);
                setOpenPixDialog(true);
              }}
            >
              <QrCode2Icon fontSize="small" aria-hidden="true" />
              Pagar via Pix (Mercado Pago)
            </button>
          )}
        </div>
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
    </section>
  );
}
