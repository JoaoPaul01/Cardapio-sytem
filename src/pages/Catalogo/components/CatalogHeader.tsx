import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import styles from '../Catalogo.module.css';

interface CatalogHeaderProps {
  filterText: string;
  onFilterChange: (text: string) => void;
  onNewCategory: () => void;
}

export function CatalogHeader({ filterText, onFilterChange, onNewCategory }: CatalogHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={styles.headerWrap}>
      <div className={styles.titleRow}>
        <div>
          <h1 id="catalogo-title" className={styles.title}>Catálogo</h1>
          <p className={styles.subtitle}>Cadastre categorias, carnes, porções e bebidas</p>
        </div>

        <div className={styles.navShortcuts}>
          <button
            type="button"
            className={styles.navShortcutBtn}
            onClick={() => navigate('/mesas')}
            title="Ir para Mesas"
          >
            <DashboardIcon fontSize="small" aria-hidden="true" />
            <span>Mesas</span>
          </button>
          <button
            type="button"
            className={styles.navShortcutBtn}
            onClick={() => navigate('/historico')}
            title="Ir para Histórico de Pedidos"
          >
            <HistoryIcon fontSize="small" aria-hidden="true" />
            <span>Histórico</span>
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <SearchIcon aria-hidden="true" />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar produto ou categoria..."
            aria-label="Buscar produto ou categoria"
            value={filterText}
            onChange={(e) => onFilterChange(e.target.value)}
          />
        </div>

        <button type="button" className={styles.primaryBtn} onClick={onNewCategory}>
          <AddIcon fontSize="small" aria-hidden="true" />
          Criar Categoria
        </button>
      </div>
    </header>
  );
}
