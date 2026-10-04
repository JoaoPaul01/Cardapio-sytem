import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Divider,
  Typography,
  Box
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';

export const drawerWidth = 260;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAppContext();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Fecha o drawer no mobile ao clicar em um link
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const drawerContent = (
    <>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="#fff">
          Churrascaria
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      
      <Box sx={{ overflow: 'auto', mt: 2, flexGrow: 1 }}>
        <List>
          {/* Dashboard */}
          <ListItem disablePadding>
            <ListItemButton 
              selected={location.pathname === '/'} 
              onClick={() => handleNavigation('/')}
              sx={{
                '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" sx={{ color: '#fff' }} />
            </ListItemButton>
          </ListItem>

          {/* Catálogo */}
          <ListItem disablePadding>
            <ListItemButton 
              selected={location.pathname === '/catalogo'} 
              onClick={() => handleNavigation('/catalogo')}
              sx={{
                '&.Mui-selected': { backgroundColor: 'rgba(255,255,255,0.1)' },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="Catálogo" sx={{ color: '#fff' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Logout Fixo Embaixo */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: '#ff4c4c' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Sair do Sistema" sx={{ color: '#ff4c4c' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Drawer Temporário para Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhor performance para abrir/fechar no mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1e1e2d' },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Drawer Permanente para Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#1e1e2d' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
