import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { CatalogHeader } from './components/CatalogHeader';
import { CategoryList } from './components/CategoryList';
import { CategoryModal } from './components/CategoryModal';
import { ProductModal } from './components/ProductModal';

export default function Catalogo() {
  const { getData } = useAppContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  
  // Modals state
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchCatalog = async () => {
    try {
      const data = await getData(locations.categories);
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar catálogo', error);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenProductModal = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setProductModalOpen(true);
  };

  // Lógica do filtro para nome do produto ou nome da categoria
  const filteredCategories = categories.map(cat => {
    const products = cat.products || [];
    const filteredProducts = products.filter((p: any) => 
      p.name.toLowerCase().includes(filterText.toLowerCase()) || 
      cat.name.toLowerCase().includes(filterText.toLowerCase())
    );
    return { ...cat, products: filteredProducts };
  }).filter(cat => 
    cat.name.toLowerCase().includes(filterText.toLowerCase()) || 
    (cat.products && cat.products.length > 0)
  );

  return (
    <Box>
      <CatalogHeader 
        filterText={filterText} 
        onFilterChange={setFilterText} 
        onNewCategory={() => setCategoryModalOpen(true)} 
      />
      
      <CategoryList 
        categories={filteredCategories} 
        onAddProduct={handleOpenProductModal} 
      />

      <CategoryModal 
        open={isCategoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
        onSuccess={fetchCatalog}
      />

      {selectedCategoryId && (
        <ProductModal 
          open={isProductModalOpen} 
          categoryId={selectedCategoryId} 
          onClose={() => setProductModalOpen(false)} 
          onSuccess={fetchCatalog}
        />
      )}
    </Box>
  );
}
