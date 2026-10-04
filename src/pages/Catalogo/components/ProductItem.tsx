import React, { useState, useRef } from 'react';
import { Card, CardContent, Typography, Box, IconButton, TextField, InputAdornment } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppContext } from '../../../context/appContext';

interface ProductItemProps {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate?: (payload: any) => void;
}

export function ProductItem({ product, onEdit, onDelete, onUpdate }: ProductItemProps) {
  const { uploadImageData } = useAppContext();
  
  const [editingField, setEditingField] = useState<'name' | 'description' | 'price' | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedPrice = typeof product.price === 'number' 
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
    : `R$ ${parseFloat(product.price || '0').toFixed(2).replace('.', ',')}`;

  const handleDoubleClick = (field: 'name' | 'description' | 'price', value: string) => {
    setEditValue(value);
    setEditingField(field);
  };

  const handleSave = () => {
    if (editingField && onUpdate) {
      if (editingField === 'price') {
        const numericPrice = parseFloat(editValue.replace(',', '.'));
        if (!isNaN(numericPrice)) {
          onUpdate({ price: numericPrice });
        }
      } else {
        onUpdate({ [editingField]: editValue.trim() });
      }
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditingField(null);
  };

  const handleImageDoubleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      try {
        // Upload the image assuming the endpoint exists
        await uploadImageData(`products/${product.id}/image`, file);
        // Refresh component or image URL if available
        // onUpdate can trigger a re-fetch in the parent
        onUpdate({}); 
      } catch (err) {
        console.error('Erro ao fazer upload da imagem', err);
      }
    }
  };

  return (
    <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', width: '100%', cursor: 'pointer', '&:hover': { backgroundColor: '#fdfdfd' }, p: 2 }}>
      
      {/* Imagem do produto à esquerda */}
      <Box 
        sx={{ 
          width: 80, 
          height: 80, 
          minWidth: 80,
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#757575',
          fontSize: '0.7rem',
          mr: 3,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden'
        }}
        onDoubleClick={handleImageDoubleClick}
        title="Clique duas vezes para alterar a imagem"
      >
        {/* Aqui exibiríamos a imagem real se houvesse a URL na resposta da API */}
        Sem Foto
        <input 
          type="file" 
          hidden 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange}
        />
      </Box>

      {/* Conteúdo Central: Nome e Descrição */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, pr: 2 }}>
        {editingField === 'name' ? (
          <TextField 
            size="small" 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <Typography 
            variant="subtitle1" 
            sx={{ fontWeight: '500' }}
            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick('name', product.name); }}
          >
            {product.name}
          </Typography>
        )}

        {editingField === 'description' ? (
          <TextField 
            size="small"
            multiline
            rows={2}
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 20 }}
            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick('description', product.description || ''); }}
          >
            {product.description || 'Sem descrição'}
          </Typography>
        )}
      </Box>

      {/* Conteúdo à Direita: Preço e Ações */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 150, justifyContent: 'flex-end' }}>
        {editingField === 'price' ? (
          <TextField 
            size="small" 
            variant="outlined"
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            sx={{ width: 100 }}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> }
            }}
          />
        ) : (
          <Typography 
            variant="body1" 
            sx={{ fontWeight: '500', color: 'success.main', minWidth: 80, textAlign: 'right' }}
            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick('price', product.price?.toString() || ''); }}
          >
            {formattedPrice}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

    </Card>
  );
}
