import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAppContext } from '../../../context/appContext';
import { locations } from '../../../services/locations';

interface ProductModalProps {
  open: boolean;
  categoryId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ open, categoryId, onClose, onSuccess }: ProductModalProps) {
  const { postData, uploadImageData } = useAppContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !price) return;
    
    setLoading(true);
    try {
      // Cria o produto básico
      // Se houvesse o endpoint de foto configurado totalmente, 
      // faríamos o upload da foto em seguida, anexando ao ID retornado do produto.
      // const newProduct = await postData(locations.products, {...})
      // await uploadImageData(`products/${newProduct.id}/image`, file)

      await postData(locations.products, { 
        categoryId,
        name,
        description,
        price: parseFloat(price)
      });
      
      handleCancel();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar produto', error);
      alert('Não foi possível criar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setPrice('');
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Novo Produto</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Upload de Imagem Visual */}
          <Box 
            sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 3, 
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 150,
              backgroundColor: '#f9f9f9'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
            ) : (
              <>
                <PhotoCamera sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography color="textSecondary">Clique para fazer upload da foto</Typography>
              </>
            )}
            <input 
              type="file" 
              hidden 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
          </Box>

          <TextField
            label="Nome do Produto"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />

          <TextField
            label="Preço (R$)"
            fullWidth
            type="number"
            variant="outlined"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
            slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
          />

        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleCancel} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleCreate} 
          variant="contained" 
          disabled={loading || !name.trim() || !price}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
