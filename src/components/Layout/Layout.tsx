import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.mobileBar}>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Abrir menu lateral"
          onClick={handleDrawerToggle}
        >
          <MenuIcon aria-hidden="true" />
        </button>
        <span className={styles.mobileTitle}>Churrascaria</span>
      </header>

      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
