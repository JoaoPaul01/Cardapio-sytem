import { Drawer } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';
import styles from './Sidebar.module.css';

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
    if (mobileOpen) {
      handleDrawerToggle();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const isMesasActive = location.pathname === '/' || location.pathname === '/mesas';

  const drawerContent = (
    <>
      <div className={styles.brandHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0, boxShadow: '0 4px 12px rgba(228, 87, 46, 0.35)' }} />
          <div>
            <span className={styles.brandBadge}>
              <LocalFireDepartmentIcon fontSize="inherit" aria-hidden="true" />
              Churrascaria
            </span>
            <h2 className={styles.brandTitle} style={{ fontSize: '18px', margin: '2px 0 0' }}>Painel &amp; Comanda</h2>
          </div>
        </div>
      </div>

      <div className={styles.menuSection}>
        <span className={styles.sectionLabel}>Navegação</span>
        <ul className={styles.navList}>
          <li>
            <button
              type="button"
              className={`${styles.navItem} ${isMesasActive ? styles.navItemActive : ''}`}
              aria-current={isMesasActive ? 'page' : undefined}
              onClick={() => handleNavigation('/')}
            >
              <span className={styles.navIcon} aria-hidden="true">
                <DashboardIcon />
              </span>
              <span>Mesas</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`${styles.navItem} ${location.pathname === '/catalogo' ? styles.navItemActive : ''}`}
              aria-current={location.pathname === '/catalogo' ? 'page' : undefined}
              onClick={() => handleNavigation('/catalogo')}
            >
              <span className={styles.navIcon} aria-hidden="true">
                <MenuBookIcon />
              </span>
              <span>Catálogo</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={`${styles.navItem} ${location.pathname === '/historico' ? styles.navItemActive : ''}`}
              aria-current={location.pathname === '/historico' ? 'page' : undefined}
              onClick={() => handleNavigation('/historico')}
            >
              <span className={styles.navIcon} aria-hidden="true">
                <HistoryIcon />
              </span>
              <span>Histórico</span>
            </button>
          </li>
        </ul>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogoutIcon fontSize="small" aria-hidden="true" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </>
  );

  return (
    <nav className={styles.navWrapper} aria-label="Menu principal">
      {/* Drawer Temporário para Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className={styles.drawerTemp}
        slotProps={{ paper: { className: styles.drawerPaper } }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer Permanente para Desktop */}
      <Drawer
        variant="permanent"
        open
        className={styles.drawerPerm}
        slotProps={{ paper: { className: styles.drawerPaper } }}
      >
        {drawerContent}
      </Drawer>
    </nav>
  );
}
