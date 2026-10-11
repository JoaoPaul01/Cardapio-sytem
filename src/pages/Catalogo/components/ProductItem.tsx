import React, { useState, useRef } from 'react';
import { Card, Typography, Box, IconButton, TextField, InputAdornment, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppContext } from '../../../context/appContext';
import { locations } from '../../../services/locations';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedPrice = typeof product.price === 'number' 
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
    : `R$ ${parseFloat(product.price || '0').toFixed(2).replace('.', ',')}`;

  const isProductActive = product.isActive !== false;

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

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const uploadResponse = await uploadImageData('upload', file);
        const uploadedImageUrl = uploadResponse?.imageUrl || uploadResponse?.url || uploadResponse?.image || uploadResponse?.filename || uploadResponse;
        const uploadedImagePath = uploadResponse?.imagePath;
        
        if (uploadedImageUrl) {
          onUpdate({ imageUrl: uploadedImageUrl, ...(uploadedImagePath ? { imagePath: uploadedImagePath } : {}) });
        }
      } catch (err) {
        console.error('Erro ao fazer upload da imagem', err);
      } finally {
        setUploadingImage(false);
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, 
        width: '100%', 
        cursor: 'pointer', 
        '&:hover': { backgroundColor: '#fdfdfd' }, 
        p: { xs: 1.5, sm: 2 },
        gap: { xs: 1.5, sm: 2 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        {/* Imagem do produto à esquerda */}
        <Box 
          sx={{ 
            width: { xs: 64, sm: 80 }, 
            height: { xs: 64, sm: 80 }, 
            minWidth: { xs: 64, sm: 80 },
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#757575',
            fontSize: '0.7rem',
            mr: { xs: 1.5, sm: 2.5 },
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 0.85,
              boxShadow: '0 0 0 2px #1976d2'
            }
          }}
          onClick={handleImageClick}
          title="Clique para alterar a foto do produto"
        >
          {uploadingImage ? (
            <CircularProgress size={20} />
          ) : product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%239e9e9e"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
              }}
            />
          ) : (
            "Sem Foto"
          )}
          <input 
            type="file" 
            hidden 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
        </Box>

        {/* Conteúdo Central: Nome e Descrição */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0, pr: 1 }}>
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
              sx={{ fontWeight: '600', fontSize: { xs: '0.95rem', sm: '1rem' } }}
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
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 18, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick('description', product.description || ''); }}
            >
              {product.description || 'Sem descrição'}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Conteúdo de Preço, Switch e Ações */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 1, sm: 1.5 }, 
          justifyContent: 'space-between',
          borderTop: { xs: '1px solid #f0f0f0', sm: 'none' },
          pt: { xs: 1, sm: 0 },
          flexWrap: 'wrap'
        }}
      >
        {/* Preço */}
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
            sx={{ width: 90 }}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> }
            }}
          />
        ) : (
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: '700', 
              color: isProductActive ? 'success.main' : 'text.disabled', 
              minWidth: { xs: 'auto', sm: 75 }, 
              fontSize: { xs: '0.95rem', sm: '1rem' }
            }}
            onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick('price', product.price?.toString() || ''); }}
          >
            {formattedPrice}
          </Typography>
        )}

        {/* Grupo Switch + Botões de Ação */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Switch Ativo / Pausado */}
          <Box onClick={(e) => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  size="small"
                  checked={product.isActive !== false}
                  onChange={(e) => onUpdate && onUpdate({ isActive: e.target.checked })}
                  color="primary"
                />
              }
              label={
                <Typography variant="caption" sx={{ color: product.isActive !== false ? 'success.main' : 'text.disabled', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  {product.isActive !== false ? 'Ativo' : 'Pausado'}
                </Typography>
              }
            />
          </Box>
          
          {/* Botões de Ação */}
          <Box sx={{ display: 'flex', gap: 0.2 }}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Editar Produto">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Excluir Produto">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>

    </Card>
  );
}
