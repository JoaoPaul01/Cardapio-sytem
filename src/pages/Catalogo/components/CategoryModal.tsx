import React, { useState } from 'react';
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
}

export function CategoryModal({ open, onClose, onSuccess }: CategoryModalProps) {
  const { postData } = useAppContext();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await postData(locations.categories, { name });
      setName('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao criar categoria', error);
      alert('Não foi possível criar a categoria.');
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
      <DialogTitle>Nova Categoria</DialogTitle>
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
          onClick={handleCreate} 
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
