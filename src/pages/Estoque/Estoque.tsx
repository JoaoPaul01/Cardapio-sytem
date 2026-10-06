import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  CircularProgress
} from '@mui/material';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';

export default function Estoque() {
  const { getData, postData } = useAppContext();
  
  const [products, setProducts] = useState<any[]>([]);
  const [estoqueItens, setEstoqueItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEstoque, setLoadingEstoque] = useState(false);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [precoCompra, setPrecoCompra] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Puxando categorias para extrair os produtos, pois o catálogo agrupa por categoria.
      // Se locations.products retornar a lista plana, poderíamos usar diretamente.
      const categories = await getData(locations.categories);
      let allProducts: any[] = [];
      categories.forEach((cat: any) => {
        if (cat.products && Array.isArray(cat.products)) {
          allProducts = [...allProducts, ...cat.products];
        }
      });
      setProducts(allProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstoque = async () => {
    setLoadingEstoque(true);
    try {
      const data = await getData(locations.estoque);
      setEstoqueItens(data || []);
    } catch (error) {
      console.error('Erro ao buscar estoque (pode ainda não existir no backend)', error);
      // Fallback para estado local / localStorage caso o endpoint falhe
      const localEstoque = localStorage.getItem('@Cardapio:estoque');
      if (localEstoque) {
        setEstoqueItens(JSON.parse(localEstoque));
      }
    } finally {
      setLoadingEstoque(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchEstoque();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !precoCompra || !quantidade) {
      alert('Preencha todos os campos!');
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    const payload = {
      id_produto: selectedProduct.id,
      nome_produto: selectedProduct.name,
      preco_venda_catalogo: selectedProduct.price,
      preco_compra_atacado: parseFloat(precoCompra),
      quantidade_estoque: parseInt(quantidade, 10),
      data_registro: new Date().toISOString()
    };

    try {
      const response = await postData(locations.estoque, payload);
      setEstoqueItens([...estoqueItens, response]);
    } catch (error) {
      console.error('Falha ao salvar no backend. Salvando em fallback local.', error);
      // Fallback local
      const newEstoque = [...estoqueItens, { ...payload, id: Date.now().toString() }];
      setEstoqueItens(newEstoque);
      localStorage.setItem('@Cardapio:estoque', JSON.stringify(newEstoque));
    }

    // Reset form
    setSelectedProductId('');
    setPrecoCompra('');
    setQuantidade('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#fff' }}>
        Cadastro de Estoque (Atacado)
      </Typography>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#1e1e2d', color: '#fff' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Registrar Compra</Typography>
        <form onSubmit={handleSave}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            
            <TextField
              select
              label="Produto do Catálogo"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              required
              fullWidth
              sx={{ flex: '1 1 250px', backgroundColor: '#2a2a3c', borderRadius: 1, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
            >
              {loading ? (
                <MenuItem disabled>Carregando...</MenuItem>
              ) : products.length === 0 ? (
                <MenuItem disabled>Nenhum produto encontrado</MenuItem>
              ) : (
                products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} - R$ {Number(p.price).toFixed(2)}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              label="Preço de Compra (Custo Unitário)"
              type="number"
              slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              value={precoCompra}
              onChange={(e) => setPrecoCompra(e.target.value)}
              required
              sx={{ flex: '1 1 200px', backgroundColor: '#2a2a3c', borderRadius: 1, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
            />

            <TextField
              label="Quantidade Comprada"
              type="number"
              slotProps={{ htmlInput: { min: "1" } }}
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              required
              sx={{ flex: '1 1 200px', backgroundColor: '#2a2a3c', borderRadius: 1, '& .MuiInputBase-root': { color: '#fff' }, '& .MuiInputLabel-root': { color: '#aaa' } }}
            />

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ flex: '1 1 150px', height: '56px' }}
            >
              Salvar
            </Button>
          </Box>
        </form>
      </Paper>

      <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>Estoque Registrado</Typography>
      <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e2d' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold' }}>Preço Venda (Catálogo)</TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold' }}>Custo (Atacado)</TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold' }}>Qtd Estoque</TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold' }}>Data</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingEstoque ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#fff', py: 3 }}>
                  <CircularProgress color="inherit" size={24} />
                </TableCell>
              </TableRow>
            ) : estoqueItens.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ color: '#aaa', py: 3 }}>
                  Nenhum registro de estoque encontrado.
                </TableCell>
              </TableRow>
            ) : (
              estoqueItens.map((item, index) => (
                <TableRow key={item.id || index}>
                  <TableCell sx={{ color: '#fff' }}>{item.nome_produto || item.id_produto}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>R$ {Number(item.preco_venda_catalogo).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>R$ {Number(item.preco_compra_atacado).toFixed(2)}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{item.quantidade_estoque}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>
                    {item.data_registro ? new Date(item.data_registro).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
