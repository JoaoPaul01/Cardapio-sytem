import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import styles from '../Catalogo.module.css';

interface CatalogHeaderProps {
  filterText: string;
  onFilterChange: (text: string) => void;
  onNewCategory: () => void;
}

export function CatalogHeader({ filterText, onFilterChange, onNewCategory }: CatalogHeaderProps) {
  return (
    <header className={styles.headerWrap}>
      <div className={styles.titleRow}>
        <h1 id="catalogo-title" className={styles.title}>Catálogo</h1>
        <p className={styles.subtitle}>Cadastre categorias, carnes, porções e bebidas</p>
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
