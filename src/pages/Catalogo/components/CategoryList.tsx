import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Divider, Accordion, AccordionSummary, AccordionDetails, TextField, FormControlLabel, Switch } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ProductItem } from './ProductItem';

interface CategoryListProps {
  categories: any[];
  onAddProduct: (categoryId: string) => void;
  onEditCategory: (category: any) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategory: (categoryId: string, payload: any) => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (productId: string, payload: any) => void;
}

export function CategoryList({ 
  categories, 
  onAddProduct,
  onEditCategory,
  onDeleteCategory,
  onUpdateCategory,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct
}: CategoryListProps) {
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  if (categories.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Nenhuma categoria ou produto encontrado.
        </Typography>
      </Box>
    );
  }

  const handleDoubleClickCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
  };

  const handleSaveCategoryName = (categoryId: string) => {
    if (categoryNameInput.trim()) {
      onUpdateCategory(categoryId, { name: categoryNameInput.trim() });
    }
    setEditingCategoryId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') handleSaveCategoryName(categoryId);
    if (e.key === 'Escape') setEditingCategoryId(null);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {categories.map((category) => (
        <Accordion key={category.id} defaultExpanded sx={{ mb: 2, borderRadius: '8px !important', '&:before': { display: 'none' }, boxShadow: 2 }}>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                width: '100%', 
                gap: { xs: 1, sm: 2 },
                pr: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                {editingCategoryId === category.id ? (
                  <TextField 
                    size="small" 
                    value={categoryNameInput} 
                    onChange={(e) => setCategoryNameInput(e.target.value)}
                    onBlur={() => handleSaveCategoryName(category.id)}
                    onKeyDown={(e) => handleKeyDown(e, category.id)}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  />
                ) : (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      color: 'text.primary', 
                      cursor: 'text',
                      fontSize: { xs: '1rem', sm: '1.25rem' }
                    }}
                    onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClickCategory(category); }}
                  >
                    {category.name}
                  </Typography>
                )}
              </Box>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexWrap: 'wrap',
                  gap: 0.5,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'space-between', sm: 'flex-end' }
                }} 
                onClick={(e) => e.stopPropagation()}
              >
                <FormControlLabel
                  sx={{ mr: { xs: 0, sm: 1 }, my: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={category.isActive !== false}
                      onChange={(e) => onUpdateCategory(category.id, { isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ color: category.isActive !== false ? 'success.main' : 'text.disabled', fontWeight: 'bold' }}>
                      {category.isActive !== false ? 'Ativa' : 'Pausada'}
                    </Typography>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton component="div" size="small" color="primary" onClick={() => onEditCategory(category)} title="Editar Categoria">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton component="div" size="small" color="error" onClick={() => onDeleteCategory(category.id)} title="Excluir Categoria">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button 
                    component="div"
                    variant="text" 
                    size="small"
                    startIcon={<AddCircleOutlinedIcon />}
                    onClick={() => onAddProduct(category.id)}
                    sx={{ ml: 0.5, textTransform: 'none', px: 1, py: 0.5, fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: '#fbfbfb' }}>
            {category.products && category.products.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                {category.products.map((product: any) => (
                  <ProductItem 
                    key={product.id} 
                    product={product} 
                    onEdit={() => onEditProduct({ ...product, categoryId: category.id })}
                    onDelete={() => onDeleteProduct(product.id)}
                    onUpdate={(payload) => onUpdateProduct(product.id, payload)}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ py: 3, textAlign: 'center' }}>
                Nenhum produto cadastrado nesta categoria.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
