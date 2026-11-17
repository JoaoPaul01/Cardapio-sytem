import { useState, useEffect } from 'react';
import { Dialog, Switch } from '@mui/material';
import { useAppContext } from '../../../context/appContext';
import { locations } from '../../../services/locations';
import styles from '../Catalogo.module.css';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CategoryModal({ open, onClose, onSuccess, initialData }: CategoryModalProps) {
  const { postData, patchData } = useAppContext();
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setIsActive(initialData.isActive !== false);
    } else {
      setName('');
      setIsActive(true);
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = { name: name.trim(), isActive };
      if (initialData) {
        await patchData(`${locations.categories}/${initialData.id}`, payload);
      } else {
        await postData(locations.categories, payload);
      }
      setName('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar categoria', error);
      alert('Não foi possível salvar a categoria.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setIsActive(true);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <h2 className={styles.dialogTitle}>
        {initialData ? 'Editar Categoria' : 'Nova Categoria'}
      </h2>

      <div className={styles.dialogBody}>
        <div className={styles.field}>
          <label htmlFor="category-name" className={styles.label}>
            Nome da Categoria
          </label>
          <input
            id="category-name"
            className={styles.input}
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className={styles.switchLabel}>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="warning"
            disabled={loading}
          />
          <span className={isActive ? styles.activeText : styles.pausedText}>
            {isActive
              ? 'Categoria Ativa (visível no cardápio)'
              : 'Categoria Pausada (oculta para clientes)'}
          </span>
        </label>
      </div>

      <div className={styles.dialogActions}>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handleSave}
          disabled={loading || !name.trim()}
        >
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          Salvar
        </button>
      </div>
    </Dialog>
  );
}
