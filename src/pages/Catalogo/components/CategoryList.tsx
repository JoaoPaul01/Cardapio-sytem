import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Switch } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ProductItem } from './ProductItem';
import styles from '../Catalogo.module.css';

interface CategoryListProps {
  categories: any[];
  onAddProduct: (categoryId: string) => void;
  onEditCategory: (category: any) => void;
  onDeleteCategory: (categoryId: string) => void;
  onUpdateCategory: (categoryId: string, payload: any) => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProduct: (productId: string, payload: any) => void;
}

export function CategoryList({ 
  categories, 
  onAddProduct,
  onEditCategory,
  onDeleteCategory,
  onUpdateCategory,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct
}: CategoryListProps) {
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');

  if (categories.length === 0) {
    return (
      <div className={styles.emptyBox}>
        <p>Nenhuma categoria ou produto encontrado.</p>
      </div>
    );
  }

  const handleDoubleClickCategory = (category: any) => {
    setEditingCategoryId(category.id);
    setCategoryNameInput(category.name);
  };

  const handleSaveCategoryName = (categoryId: string) => {
    if (categoryNameInput.trim()) {
      onUpdateCategory(categoryId, { name: categoryNameInput.trim() });
    }
    setEditingCategoryId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') handleSaveCategoryName(categoryId);
    if (e.key === 'Escape') setEditingCategoryId(null);
  };

  return (
    <div className={styles.listWrap}>
      {categories.map((category) => {
        const isCatActive = category.isActive !== false;
        return (
          <Accordion key={category.id} defaultExpanded className={styles.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon className={styles.expandIcon} />}
              className={styles.accordionSummary}
            >
              <div className={styles.summaryContent}>
                <div className={styles.categoryTitleWrap}>
                  {editingCategoryId === category.id ? (
                    <input
                      className={styles.inlineInput}
                      value={categoryNameInput}
                      onChange={(e) => setCategoryNameInput(e.target.value)}
                      onBlur={() => handleSaveCategoryName(category.id)}
                      onKeyDown={(e) => handleKeyDown(e, category.id)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <h2
                      className={styles.categoryTitle}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClickCategory(category);
                      }}
                    >
                      {category.name}
                    </h2>
                  )}
                </div>

                <div
                  className={styles.categoryActions}
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className={styles.switchLabel}>
                    <Switch
                      size="small"
                      checked={isCatActive}
                      onChange={(e) => onUpdateCategory(category.id, { isActive: e.target.checked })}
                      color="warning"
                    />
                    <span className={isCatActive ? styles.activeText : styles.pausedText}>
                      {isCatActive ? 'Ativa' : 'Pausada'}
                    </span>
                  </label>

                  <div className={styles.actionGroup}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onEditCategory(category)}
                      title="Editar Categoria"
                      aria-label={`Editar categoria ${category.name}`}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      onClick={() => onDeleteCategory(category.id)}
                      title="Excluir Categoria"
                      aria-label={`Excluir categoria ${category.name}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                    <button
                      type="button"
                      className={styles.addProductBtn}
                      onClick={() => onAddProduct(category.id)}
                    >
                      <AddCircleOutlinedIcon fontSize="small" aria-hidden="true" />
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </AccordionSummary>

            <AccordionDetails className={styles.accordionDetails}>
              {category.products && category.products.length > 0 ? (
                <div className={styles.productList}>
                  {category.products.map((product: any) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      onEdit={() => onEditProduct({ ...product, categoryId: category.id })}
                      onDelete={() => onDeleteProduct(product.id)}
                      onUpdate={(payload) => onUpdateProduct(product.id, payload)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyBox}>
                  <p>Nenhum produto cadastrado nesta categoria.</p>
                </div>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
