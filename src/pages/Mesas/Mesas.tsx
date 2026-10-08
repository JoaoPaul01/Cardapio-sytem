import React, { useCallback, useEffect, useState } from 'react';
import {
  Typography, Paper, Box, Button, Grid, Card, CardActionArea, Dialog, DialogTitle,
  DialogContent, TextField, DialogActions, CircularProgress, Alert, Chip, IconButton,
  DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TableBarIcon from '@mui/icons-material/TableBar';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';

interface Mesa {
  id: string;
  tableNumber: number;
  seats?: number;
  status: string;
  activeOrder?: { totalAmount: string; itemsCount: number } | null;
}

const statusLabel: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  AVAILABLE: { label: 'Livre', color: 'success' },
  OCCUPIED: { label: 'Ocupada', color: 'warning' },
  BILL_REQUESTED: { label: 'Conta pedida', color: 'error' },
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error || error?.message || fallback;

export default function Mesas() {
  const { getData, postData, removeData } = useAppContext();
  const navigate = useNavigate();

  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [newMesaNumber, setNewMesaNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [mesaToDelete, setMesaToDelete] = useState<Mesa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchMesas = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getData(locations.tables);
      setMesas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar mesas', error);
      setLoadError(getErrorMessage(error, 'Não foi possível carregar as mesas.'));
    } finally {
      setLoading(false);
    }
  }, [getData]);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewMesaNumber('');
    setSaveError('');
  };

  const handleCreateMesa = async () => {
    const tableNumber = parseInt(newMesaNumber, 10);
    if (!tableNumber || tableNumber <= 0) {
      setSaveError('Informe um número de mesa válido.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      // O backend exige "tableNumber" numérico (POST /tables)
      await postData(locations.tables, { tableNumber });
      handleCloseDialog();
      fetchMesas();
    } catch (error) {
      console.error('Erro ao criar mesa', error);
      setSaveError(getErrorMessage(error, 'Não foi possível criar a mesa.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMesa = async () => {
    if (!mesaToDelete) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await removeData(`${locations.tables}/${mesaToDelete.id}`);
      setMesaToDelete(null);
      fetchMesas();
    } catch (error) {
      console.error('Erro ao excluir mesa', error);
      setDeleteError(getErrorMessage(error, 'Não foi possível excluir a mesa.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, color: "black" }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Mesas
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
        <Typography sx={{color: "black"}}>Criar uma mesa </Typography>
        </Button>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={fetchMesas}>Tentar novamente</Button>}>
          {loadError}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {mesas.map((mesa) => {
            const status = statusLabel[mesa.status] || { label: mesa.status, color: 'default' as const };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={mesa.id}>
                <Card elevation={3} sx={{ borderRadius: 2, position: 'relative' }}>
                  <IconButton 
                    onClick={(e) => { e.stopPropagation(); setMesaToDelete(mesa); }} 
                    sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <CardActionArea
                    onClick={() => navigate(`/mesa/${mesa.id}`)}
                    sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <TableBarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Mesa {mesa.tableNumber}
                    </Typography>
                    <Chip size="small" label={status.label} color={status.color} sx={{ mt: 1 }} />
                    {mesa.activeOrder && (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        {mesa.activeOrder.itemsCount} itens • R$ {mesa.activeOrder.totalAmount}
                      </Typography>
                    )}
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
          {mesas.length === 0 && !loadError && (
            <Grid size={12}>
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Typography color="textSecondary">Nenhuma mesa criada ainda.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: "black" }}>Criar uma mesa</DialogTitle>
        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Número da mesa"
            type="number"
            fullWidth
            variant="outlined"
            value={newMesaNumber}
            onChange={(e) => setNewMesaNumber(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateMesa(); }}
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreateMesa} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} color="inherit" /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!mesaToDelete} onClose={() => setMesaToDelete(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold', color: 'black' }}>Excluir Mesa</DialogTitle>
        <DialogContent>
          {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
          <DialogContentText>
            Tem certeza que deseja excluir a mesa {mesaToDelete?.tableNumber}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setMesaToDelete(null); setDeleteError(''); }} disabled={deleting}>Cancelar</Button>
          <Button onClick={handleDeleteMesa} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={22} color="inherit" /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
