import React from 'react';
import { Box, Typography, Button, Paper, Divider } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import { ProductItem } from './ProductItem';

interface CategoryListProps {
  categories: any[];
  onAddProduct: (categoryId: string) => void;
}

export function CategoryList({ categories, onAddProduct }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Nenhuma categoria ou produto encontrado.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {categories.map((category) => (
        <Paper key={category.id} elevation={1} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              {category.name}
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddCircleOutlinedIcon />}
              onClick={() => onAddProduct(category.id)}
            >
              Adicionar Produto
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {category.products && category.products.length > 0 ? (
            <Box>
              {category.products.map((product: any) => (
                <ProductItem key={product.id} product={product} />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" sx={{ py: 2, textAlign: 'center', backgroundColor: '#fafafa', borderRadius: 1 }}>
              Nenhum produto cadastrado nesta categoria.
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
}
