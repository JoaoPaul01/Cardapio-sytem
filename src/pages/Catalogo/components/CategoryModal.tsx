import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      if (initialData) {
        await patchData(`${locations.categories}/${initialData.id}`, { name });
      } else {
        await postData(locations.categories, { name });
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
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nome da Categoria"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          sx={{ mt: 2 }}
        />
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
