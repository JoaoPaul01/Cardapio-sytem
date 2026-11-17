import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isMesasActive = location.pathname === '/' || location.pathname === '/mesas';

  return (
    <div className={styles.shell}>
      <header className={styles.mobileBar}>
        <div className={styles.mobileLeft}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Abrir menu lateral"
            onClick={handleDrawerToggle}
          >
            <MenuIcon aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.brandLink}
            onClick={() => navigate('/')}
            title="Ir para o início (Mesas)"
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <span className={styles.mobileTitle}>Churrascaria</span>
          </button>
        </div>

        {/* Atalhos rápidos de navegação no mobile */}
        <div className={styles.mobileShortcuts}>
          <button
            type="button"
            className={`${styles.navQuickBtn} ${isMesasActive ? styles.navQuickBtnActive : ''}`}
            onClick={() => navigate('/')}
            title="Mesas"
            aria-label="Ir para Mesas"
          >
            <DashboardIcon fontSize="small" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.navQuickBtn} ${location.pathname === '/catalogo' ? styles.navQuickBtnActive : ''}`}
            onClick={() => navigate('/catalogo')}
            title="Catálogo"
            aria-label="Ir para Catálogo"
          >
            <MenuBookIcon fontSize="small" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`${styles.navQuickBtn} ${location.pathname === '/historico' ? styles.navQuickBtnActive : ''}`}
            onClick={() => navigate('/historico')}
            title="Histórico"
            aria-label="Ir para Histórico"
          >
            <HistoryIcon fontSize="small" aria-hidden="true" />
          </button>
        </div>
      </header>

      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
