import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import { useAppContext } from '../../../context/appContext';
import { locations } from '../../../services/locations';

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
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ color: 'black' }}>{initialData ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Categoria"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <FormControlLabel
            control={
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                color="primary"
                disabled={loading}
              />
            }
            label={isActive ? "Categoria Ativa (visível no cardápio)" : "Categoria Pausada (oculta para clientes)"}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
