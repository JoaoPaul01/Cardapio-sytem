import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface ProductItemProps {
  product: any;
}

export function ProductItem({ product }: ProductItemProps) {
  // Converte o preço para moeda local ou pelo menos exibe bonitinho
  const formattedPrice = typeof product.price === 'number' 
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
    : `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}`;

  return (
    <Card variant="outlined" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
      {/* Aqui entraria a foto se a API retornar. Vamos usar um placeholder elegante */}
      <Box 
        sx={{ 
          width: 80, 
          height: 80, 
          backgroundColor: '#e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#757575',
          fontSize: '0.8rem',
          ml: 2,
          borderRadius: 1
        }}
      >
        Sem Foto
      </Box>

      <CardContent sx={{ flex: 1 }}>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
          {product.description || 'Sem descrição'}
        </Typography>
        <Typography variant="subtitle1" fontWeight="bold" color="primary">
          {formattedPrice}
        </Typography>
      </CardContent>
    </Card>
  );
}
