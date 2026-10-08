import React, { useState } from 'react';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography 
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar, drawerWidth } from '../Sidebar/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <CssBaseline />
      
      {/* AppBar aparece apenas no mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' },
          backgroundColor: '#1e1e2d'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Churrascaria
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Responsiva */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      {/* Área de conteúdo principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 4 }, 
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: '100%',
          overflowX: 'hidden',
          mt: { xs: 8, sm: 0 } // Espaço para a AppBar no mobile
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
