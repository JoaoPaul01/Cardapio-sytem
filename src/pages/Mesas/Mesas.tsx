import { useCallback, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableBarIcon from '@mui/icons-material/TableBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import styles from './Mesas.module.css';

interface Mesa {
  id: string;
  tableNumber: number;
  seats?: number;
  status: string;
  activeOrder?: { totalAmount: string; itemsCount: number } | null;
}

const statusLabel: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  AVAILABLE: { label: 'Livre', color: 'success' },
  OCCUPIED: { label: 'Ocupada', color: 'warning' },
  BILL_REQUESTED: { label: 'Conta pedida', color: 'error' },
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error || error?.message || fallback;

export default function Mesas() {
  const { getData, postData, removeData } = useAppContext();
  const navigate = useNavigate();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [newMesaNumber, setNewMesaNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [mesaToDelete, setMesaToDelete] = useState<Mesa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMesas = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getData(locations.tables);
      setMesas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar mesas', error);
      setLoadError(getErrorMessage(error, 'Não foi possível carregar as mesas.'));
    } finally {
      setLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewMesaNumber('');
    setSaveError('');
  };

  const handleCreateMesa = async () => {
    const tableNumber = parseInt(newMesaNumber, 10);
    if (!tableNumber || tableNumber <= 0) {
      setSaveError('Informe um número de mesa válido.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      await postData(locations.tables, { tableNumber });
      handleCloseDialog();
      fetchMesas();
    } catch (error) {
      console.error('Erro ao criar mesa', error);
      setSaveError(getErrorMessage(error, 'Não foi possível criar a mesa.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMesa = async () => {
    if (!mesaToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await removeData(`${locations.tables}/${mesaToDelete.id}`);
      setMesaToDelete(null);
      fetchMesas();
    } catch (error) {
      console.error('Erro ao excluir mesa', error);
      setDeleteError(getErrorMessage(error, 'Não foi possível excluir a mesa.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className={styles.page} aria-labelledby="mesas-title">
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 id="mesas-title" className={styles.title}>Mesas</h1>
          <p className={styles.subtitle}>Gerencie o salão e acompanhe as comandas ativas</p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setOpenDialog(true)}>
          <AddIcon fontSize="small" aria-hidden="true" />
          Criar mesa
        </button>
      </header>

      {loadError && (
        <div className={styles.errorAlert} role="alert">
          <span>{loadError}</span>
          <button type="button" className={styles.retryBtn} onClick={fetchMesas}>
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.stateBox} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <span>Carregando mesas...</span>
        </div>
      ) : mesas.length === 0 && !loadError ? (
        <div className={styles.stateBox}>
          <p>Nenhuma mesa criada ainda.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {mesas.map((mesa) => {
            const status = statusLabel[mesa.status] || { label: mesa.status, color: 'default' as const };
            const statusClass = styles[`status_${mesa.status}`] || styles.status_AVAILABLE;
            return (
              <article key={mesa.id} className={styles.card}>
                <button
                  type="button"
                  className={styles.deleteIconBtn}
                  aria-label={`Excluir Mesa ${mesa.tableNumber}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMesaToDelete(mesa);
                  }}
                >
                  <DeleteIcon fontSize="small" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className={styles.cardAction}
                  onClick={() => navigate(`/mesa/${mesa.id}`)}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.iconBadge} aria-hidden="true">
                      <TableBarIcon className={styles.tableIcon} />
                    </span>
                    <div className={styles.cardTitleWrap}>
                      <span className={styles.tableName}>Mesa {mesa.tableNumber}</span>
                      <span className={`${styles.badge} ${statusClass}`}>
                        <span className={styles.dot} aria-hidden="true" />
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    {mesa.activeOrder ? (
                      <>
                        <span className={styles.orderItems}>
                          {mesa.activeOrder.itemsCount}{' '}
                          {mesa.activeOrder.itemsCount === 1 ? 'item' : 'itens'}
                        </span>
                        <span className={styles.orderTotal}>
                          R$ {mesa.activeOrder.totalAmount}
                        </span>
                      </>
                    ) : (
                      <span className={styles.orderEmpty}>Disponível • Abrir comanda</span>
                    )}
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <h2 className={styles.dialogTitle}>Criar uma mesa</h2>
        <div className={styles.dialogBody}>
          {saveError && (
            <div className={styles.errorAlert} role="alert">
              {saveError}
            </div>
          )}
          <label htmlFor="new-mesa-number" className={styles.label}>
            Número da mesa
          </label>
          <input
            id="new-mesa-number"
            className={styles.input}
            autoFocus
            type="number"
            min={1}
            value={newMesaNumber}
            onChange={(e) => setNewMesaNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateMesa();
            }}
          />
        </div>
        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={handleCloseDialog}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCreateMesa}
            disabled={saving}
          >
            {saving ? <span className={styles.btnSpinner} aria-hidden="true" /> : 'Criar'}
          </button>
        </div>
      </Dialog>

      <Dialog
        open={!!mesaToDelete}
        onClose={() => setMesaToDelete(null)}
        fullWidth
        maxWidth="xs"
        slotProps={{ paper: { className: styles.dialogPaper } }}
      >
        <h2 className={styles.dialogTitle}>Excluir Mesa</h2>
        <div className={styles.dialogBody}>
          {deleteError && (
            <div className={styles.errorAlert} role="alert">
              {deleteError}
            </div>
          )}
          <p className={styles.dialogText}>
            Tem certeza que deseja excluir a mesa {mesaToDelete?.tableNumber}?
          </p>
        </div>
        <div className={styles.dialogActions}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={() => {
              setMesaToDelete(null);
              setDeleteError('');
            }}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={handleDeleteMesa}
            disabled={deleting}
          >
            {deleting ? <span className={styles.btnSpinner} aria-hidden="true" /> : 'Excluir'}
          </button>
        </div>
      </Dialog>
    </section>
  );
}
