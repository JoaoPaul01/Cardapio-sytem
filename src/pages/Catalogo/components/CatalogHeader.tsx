import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

interface CatalogHeaderProps {
  filterText: string;
  onFilterChange: (text: string) => void;
  onNewCategory: () => void;
}

export function CatalogHeader({ filterText, onFilterChange, onNewCategory }: CatalogHeaderProps) {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.6rem', sm: '2.125rem' } }} gutterBottom>
        Catálogo
      </Typography>

      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 1.5, sm: 2 }, 
          display: 'flex', 
          gap: { xs: 1.5, sm: 2 }, 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1, maxWidth: { xs: '100%', sm: 400 } }}>
          <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
          <TextField 
            label="Buscar produto ou categoria" 
            variant="standard" 
            fullWidth
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </Box>

        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={onNewCategory}
          sx={{ textTransform: 'none', fontWeight: 600, width: { xs: '100%', sm: 'auto' } }}
        >
          Criar Categoria
        </Button>
      </Paper>
    </Box>
  );
}
