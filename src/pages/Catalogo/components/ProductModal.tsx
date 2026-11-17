import React, { useState, useRef, useEffect } from 'react';
import { Dialog, Switch } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAppContext } from '../../../context/appContext';
import { locations } from '../../../services/locations';
import styles from '../Catalogo.module.css';

interface ProductModalProps {
  open: boolean;
  categoryId: string;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function ProductModal({ open, categoryId, onClose, onSuccess, initialData }: ProductModalProps) {
  const { postData, patchData, uploadImageData } = useAppContext();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      setIsActive(initialData.isActive !== false);
      setPreview(initialData.imageUrl || null);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setIsActive(true);
      setFile(null);
      setPreview(null);
    }
  }, [initialData, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price) return;

    setLoading(true);
    try {
      let uploadedImageUrl = initialData?.imageUrl || '';
      let uploadedImagePath = initialData?.imagePath || undefined;

      if (file) {
        const uploadResponse = await uploadImageData('upload', file);
        uploadedImageUrl = uploadResponse?.imageUrl || uploadResponse?.url || uploadResponse?.image || uploadResponse?.filename || uploadResponse;
        uploadedImagePath = uploadResponse?.imagePath;
      }

      const payload: any = {
        categoryId,
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        isActive,
        isAvailable: true
      };

      if (uploadedImageUrl) {
        payload.imageUrl = uploadedImageUrl;
      }
      if (uploadedImagePath) {
        payload.imagePath = uploadedImagePath;
      }

      if (initialData) {
        await patchData(`${locations.products}/${initialData.id}`, payload);
      } else {
        await postData(locations.products, payload);
      }

      handleCancel();
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar produto', error);
      alert('Não foi possível salvar o produto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setPrice('');
    setIsActive(true);
    setFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: styles.dialogPaper } }}
    >
      <h2 className={styles.dialogTitle}>
        {initialData ? 'Editar Produto' : 'Novo Produto'}
      </h2>

      <div className={styles.dialogBody}>
        <div
          className={styles.uploadDropzone}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} alt="Preview do produto" className={styles.previewImg} />
          ) : (
            <>
              <PhotoCamera fontSize="large" aria-hidden="true" />
              <span>Clique para fazer upload da foto</span>
            </>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="product-name" className={styles.label}>
            Nome do Produto
          </label>
          <input
            id="product-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="product-desc" className={styles.label}>
            Descrição
          </label>
          <textarea
            id="product-desc"
            className={styles.textarea}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="product-price" className={styles.label}>
            Preço (R$)
          </label>
          <input
            id="product-price"
            type="number"
            step="0.01"
            min="0"
            className={styles.input}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className={styles.switchLabel}>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="warning"
            disabled={loading}
          />
          <span className={isActive ? styles.activeText : styles.pausedText}>
            {isActive
              ? 'Produto Ativo (disponível para pedidos)'
              : 'Produto Pausado (indisponível)'}
          </span>
        </label>
      </div>

      <div className={styles.dialogActions}>
        <button
          type="button"
          className={styles.ghostBtn}
          onClick={handleCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={handleSave}
          disabled={loading || !name.trim() || !price}
        >
          {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
          Salvar
        </button>
      </div>
    </Dialog>
  );
}
