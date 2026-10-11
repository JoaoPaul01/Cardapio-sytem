import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { authenticate } = useAppContext();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authenticate(locations.login, { email, password });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, #222332 0%, #151620 50%, #0d0e15 100%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: { xs: 300, sm: 500 },
          height: { xs: 300, sm: 500 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(230, 81, 0, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: { xs: 350, sm: 600 },
          height: { xs: 350, sm: 600 },
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(25, 118, 210, 0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          bgcolor: '#ffffff',
          position: 'relative',
          overflow: 'visible',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Recorte decorativo estilo Comanda no topo */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e1e2d 0%, #2a2b3d 100%)',
            pt: 4,
            pb: 3,
            px: 3,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            color: '#fff',
            textAlign: 'center',
            position: 'relative',
            borderBottom: '2px dashed #e0e0e0'
          }}
        >
          {/* Badge de Destaque */}
          <Chip
            icon={<LocalFireDepartmentIcon sx={{ '&&': { color: '#ff7043' } }} />}
            label="CHURRASCARIA & COMANDA"
            size="small"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: '#ffb74d',
              fontWeight: 700,
              letterSpacing: 1.2,
              fontSize: '0.7rem',
              mb: 1.5,
              border: '1px solid rgba(255, 183, 77, 0.3)'
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
            <RestaurantMenuIcon sx={{ fontSize: 32, color: '#ff9800' }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              Cardápio Digital
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.8, display: 'block' }}>
            Painel de Controle • Gestão de Mesas e Pedidos
          </Typography>
        </Box>

        {/* Formulário */}
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <ReceiptLongIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2d3748' }}>
              Identificação do Atendente
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="atendente@churrascaria.com"
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <TextField
              label="Senha de Acesso"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  boxShadow: '0 8px 20px rgba(25, 118, 210, 0.45)',
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Abrir Sistema'
              )}
            </Button>
          </Box>

          {/* Rodapé da Comanda */}
          <Box
            sx={{
              mt: 3.5,
              pt: 2,
              borderTop: '1px solid #edf2f7',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: '#a0aec0', fontFamily: 'monospace' }}>
              VERSÃO PWA 2.0
            </Typography>
            <Typography variant="caption" sx={{ color: '#718096', fontWeight: 600 }}>
              TERMINAL SEGURO
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
