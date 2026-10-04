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
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Catálogo
      </Typography>

      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-end', flexGrow: 1, maxWidth: 400 }}>
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
        >
          Criar Categoria
        </Button>
      </Paper>
    </Box>
  );
}
