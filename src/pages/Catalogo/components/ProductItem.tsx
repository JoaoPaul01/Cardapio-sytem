import React, { useState, useRef } from 'react';
import { Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAppContext } from '../../../context/appContext';
import styles from '../Catalogo.module.css';

interface ProductItemProps {
  product: any;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate?: (payload: any) => void;
}

export function ProductItem({ product, onEdit, onDelete, onUpdate }: ProductItemProps) {
  const { uploadImageData } = useAppContext();

  const [editingField, setEditingField] = useState<'name' | 'description' | 'price' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedPrice = typeof product.price === 'number'
    ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
    : `R$ ${parseFloat(product.price || '0').toFixed(2).replace('.', ',')}`;

  const isProductActive = product.isActive !== false;

  const handleDoubleClick = (field: 'name' | 'description' | 'price', value: string) => {
    setEditValue(value);
    setEditingField(field);
  };

  const handleSave = () => {
    if (editingField && onUpdate) {
      if (editingField === 'price') {
        const numericPrice = parseFloat(editValue.replace(',', '.'));
        if (!isNaN(numericPrice)) {
          onUpdate({ price: numericPrice });
        }
      } else {
        onUpdate({ [editingField]: editValue.trim() });
      }
    }
    setEditingField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') setEditingField(null);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUpdate) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const uploadResponse = await uploadImageData('upload', file);
        const uploadedImageUrl = uploadResponse?.imageUrl || uploadResponse?.url || uploadResponse?.image || uploadResponse?.filename || uploadResponse;
        const uploadedImagePath = uploadResponse?.imagePath;

        if (uploadedImageUrl) {
          onUpdate({ imageUrl: uploadedImageUrl, ...(uploadedImagePath ? { imagePath: uploadedImagePath } : {}) });
        }
      } catch (err) {
        console.error('Erro ao fazer upload da imagem', err);
      } finally {
        setUploadingImage(false);
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  return (
    <article className={styles.productCard}>
      <div className={styles.productMain}>
        <div
          className={styles.productThumb}
          onClick={handleImageClick}
          title="Clique para alterar a foto do produto"
        >
          {uploadingImage ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImg}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%239e9e9e"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>';
              }}
            />
          ) : (
            <span>Sem Foto</span>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className={styles.productInfo}>
          {editingField === 'name' ? (
            <input
              className={styles.inlineInput}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <h3
              className={styles.productName}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick('name', product.name);
              }}
            >
              {product.name}
            </h3>
          )}

          {editingField === 'description' ? (
            <textarea
              className={styles.inlineInput}
              rows={2}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <p
              className={styles.productDesc}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick('description', product.description || '');
              }}
            >
              {product.description || 'Sem descrição'}
            </p>
          )}
        </div>
      </div>

      <div className={styles.productMeta}>
        {editingField === 'price' ? (
          <input
            className={styles.inlinePriceInput}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className={`${styles.productPrice} ${!isProductActive ? styles.productPricePaused : ''}`}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleClick('price', product.price?.toString() || '');
            }}
          >
            {formattedPrice}
          </span>
        )}

        <div className={styles.actionGroup}>
          <label className={styles.switchLabel} onClick={(e) => e.stopPropagation()}>
            <Switch
              size="small"
              checked={isProductActive}
              onChange={(e) => onUpdate && onUpdate({ isActive: e.target.checked })}
              color="warning"
            />
            <span className={isProductActive ? styles.activeText : styles.pausedText}>
              {isProductActive ? 'Ativo' : 'Pausado'}
            </span>
          </label>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            title="Editar Produto"
            aria-label={`Editar produto ${product.name}`}
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Excluir Produto"
            aria-label={`Excluir produto ${product.name}`}
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>
    </article>
  );
}
