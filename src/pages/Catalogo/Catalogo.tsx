import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';
import { CatalogHeader } from './components/CatalogHeader';
import { CategoryList } from './components/CategoryList';
import { CategoryModal } from './components/CategoryModal';
import { ProductModal } from './components/ProductModal';
import styles from './Catalogo.module.css';

export default function Catalogo() {
  const { getData, removeData, patchData } = useAppContext();
  const [categories, setCategories] = useState<any[]>([]);
  const [filterText, setFilterText] = useState('');
  
  // Modals state
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  
  // Edit / Add state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  const sortCatalogItems = (data: any[]) => {
    if (!Array.isArray(data)) return [];

    return data
      .map((cat: any) => {
        const products = Array.isArray(cat.products) ? [...cat.products] : [];
        products.sort((a: any, b: any) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (a.createdAt) return -1;
          if (b.createdAt) return 1;
          return String(b.id || '').localeCompare(String(a.id || ''));
        });
        return { ...cat, products };
      })
      .sort((a: any, b: any) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (a.createdAt) return -1;
        if (b.createdAt) return 1;
        return String(b.id || '').localeCompare(String(a.id || ''));
      });
  };

  const fetchCatalog = async () => {
    try {
      const data = await getData(locations.categories);
      setCategories(sortCatalogItems(data));
    } catch (error) {
      console.error('Erro ao buscar catálogo', error);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenCategoryModal = (category?: any) => {
    setCategoryToEdit(category || null);
    setCategoryModalOpen(true);
  };

  const handleOpenProductModal = (categoryId: string, product?: any) => {
    setSelectedCategoryId(categoryId);
    setProductToEdit(product || null);
    setProductModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await removeData(`${locations.categories}/${categoryId}`);
      fetchCatalog();
    } catch (error) {
      console.error('Erro ao excluir categoria', error);
      alert('Não foi possível excluir a categoria.');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await removeData(`${locations.products}/${productId}`);
      fetchCatalog();
    } catch (error) {
      console.error('Erro ao excluir produto', error);
      alert('Não foi possível excluir o produto.');
    }
  };

  const handleUpdateCategory = async (categoryId: string, payload: any) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, ...payload } : cat
      ));
      await patchData(`${locations.categories}/${categoryId}`, payload);
      await fetchCatalog();
    } catch (error) {
      console.error('Erro ao atualizar categoria', error);
      alert('Não foi possível atualizar a categoria.');
    }
  };

  const handleUpdateProduct = async (productId: string, payload: any) => {
    try {
      setCategories(prev => prev.map(cat => ({
        ...cat,
        products: (cat.products || []).map((p: any) => 
          p.id === productId ? { ...p, ...payload } : p
        )
      })));
      await patchData(`${locations.products}/${productId}`, payload);
      await fetchCatalog();
    } catch (error) {
      console.error('Erro ao atualizar produto', error);
      alert('Não foi possível atualizar o produto.');
    }
  };

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
    <section className={styles.page} aria-labelledby="catalogo-title">
      <CatalogHeader 
        filterText={filterText} 
        onFilterChange={setFilterText} 
        onNewCategory={() => handleOpenCategoryModal()} 
      />
      
      <CategoryList 
        categories={filteredCategories} 
        onAddProduct={(categoryId) => handleOpenProductModal(categoryId)} 
        onEditCategory={handleOpenCategoryModal}
        onDeleteCategory={handleDeleteCategory}
        onUpdateCategory={handleUpdateCategory}
        onEditProduct={(product) => handleOpenProductModal(product.categoryId, product)}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProduct={handleUpdateProduct}
      />

      <CategoryModal 
        open={isCategoryModalOpen} 
        onClose={() => setCategoryModalOpen(false)} 
        onSuccess={fetchCatalog}
        initialData={categoryToEdit}
      />

      {selectedCategoryId && (
        <ProductModal 
          open={isProductModalOpen} 
          categoryId={selectedCategoryId} 
          onClose={() => setProductModalOpen(false)} 
          onSuccess={fetchCatalog}
          initialData={productToEdit}
        />
      )}
    </section>
  );
}
