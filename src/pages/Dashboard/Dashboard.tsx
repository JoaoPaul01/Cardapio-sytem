import React from 'react';
import { Typography, Paper, Box } from '@mui/material';
import { useAppContext } from '../../context/appContext';

export default function Dashboard() {
  const { user } = useAppContext();

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Painel de Controle
      </Typography>
      
      <Paper elevation={2} sx={{ p: 4, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Visão Geral
        </Typography>
        <Typography variant="body1">
          Bem-vindo de volta, <strong>{user?.name || 'Administrador'}</strong>!
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Utilize o menu lateral para gerenciar os produtos, categorias e mesas do seu restaurante.
        </Typography>
      </Paper>
    </Box>
  );
}
