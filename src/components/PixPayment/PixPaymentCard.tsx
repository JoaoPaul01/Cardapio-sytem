import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  LinearProgress,
  Chip,
  Snackbar,
  Divider,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/appContext';
import { locations } from '../../services/locations';

export interface MercadoPagoQrResponse {
  orderId: string;
  tableNumber?: number;
  totalAmount: string;
  qr_data: string;
  qrCodeBase64: string;
  mercadoPagoOrderId?: string;
}

interface PixPaymentCardProps {
  orderId: string;
  onSuccess?: () => void;
  onBack?: () => void;
  autoRedirect?: boolean;
  redirectDelayMs?: number;
}

const TOTAL_COUNTDOWN_SECONDS = 600; // 10 minutos (600 segundos)
const POLLING_INTERVAL_MS = 4000; // Polling a cada 4 segundos (entre 3 e 5 segundos)

export const PixPaymentCard: React.FC<PixPaymentCardProps> = ({
  orderId,
  onSuccess,
  onBack,
  autoRedirect = true,
  redirectDelayMs = 3000,
}) => {
  const { getData, postData } = useAppContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [qrResponse, setQrResponse] = useState<MercadoPagoQrResponse | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);

  // Regra de tempo (10 minutos)
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_COUNTDOWN_SECONDS);
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Status de pagamento
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState<boolean>(false);

  // Refs para controle de timers e concorrência
  const countdownIntervalRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);
  const isCheckingRef = useRef<boolean>(false);
  const hasTriggeredSuccessRef = useRef<boolean>(false);

  const clearTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Busca detalhes da comanda e gera o QR Code inicial
  const generateQrCode = useCallback(async () => {
    clearTimers();
    setLoading(true);
    setError('');
    setIsExpired(false);
    setIsPaid(false);
    setCopied(false);
    setQrResponse(null);
    setTimeLeft(TOTAL_COUNTDOWN_SECONDS);
    hasTriggeredSuccessRef.current = false;
    isCheckingRef.current = false;

    try {
      // 1. Verifica se a comanda já está paga
      const order = await getData(locations.orderById(orderId));
      setOrderDetails(order);

      if (order.status === 'PAID') {
        setIsPaid(true);
        setLoading(false);
        return;
      }

      // 2. Faz a requisição POST para gerar o QR Code dinâmico do Mercado Pago
      const response: MercadoPagoQrResponse = await postData(
        locations.orderQrCode(orderId),
        {}
      );

      setQrResponse(response);
    } catch (err: any) {
      console.error('Erro ao gerar QR Code Pix:', err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível gerar o QR Code do Mercado Pago. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [getData, postData, orderId]);

  // Carrega o QR Code ao montar ou quando orderId muda
  useEffect(() => {
    generateQrCode();
    return () => {
      clearTimers();
    };
  }, [generateQrCode, clearTimers]);

  // Cronômetro regressivo de 10 minutos
  useEffect(() => {
    if (loading || isPaid || isExpired || !qrResponse) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [loading, isPaid, isExpired, qrResponse]);

  // Polling de verificação de status (a cada 3 a 5 segundos)
  useEffect(() => {
    if (loading || isPaid || isExpired || error || !qrResponse) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const checkOrderStatus = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const res = await getData(locations.orderStatusMp(orderId));
        if (res?.status === 'pago') {
          clearTimers();
          setIsPaid(true);
        } else if (res?.status === 'expirado') {
          clearTimers();
          setIsExpired(true);
        } else if (res?.status === 'cancelado') {
          clearTimers();
          setError('O pedido foi cancelado no Mercado Pago.');
        }
      } catch (err) {
        // Fallback: tenta buscar a comanda local diretamente
        try {
          const fallbackOrder = await getData(locations.orderById(orderId));
          if (fallbackOrder?.status === 'PAID') {
            clearTimers();
            setIsPaid(true);
          }
        } catch {
          // ignora erro transitório
        }
      } finally {
        isCheckingRef.current = false;
      }
    };

    pollingIntervalRef.current = setInterval(checkOrderStatus, POLLING_INTERVAL_MS);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [loading, isPaid, isExpired, error, qrResponse, getData, orderId, clearTimers]);

  // Efeito ao confirmar o pagamento (dispara uma única vez)
  useEffect(() => {
    if (isPaid) {
      clearTimers();
      if (!hasTriggeredSuccessRef.current) {
        hasTriggeredSuccessRef.current = true;
        if (onSuccess) {
          onSuccess();
        }
      }

      if (autoRedirect) {
        const timer = setTimeout(() => {
          navigate('/mesas');
        }, redirectDelayMs);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [isPaid, clearTimers, onSuccess, autoRedirect, redirectDelayMs, navigate]);

  // Formatação de minutos e segundos (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Copiar código Pix para a área de transferência
  const handleCopyCode = async () => {
    if (!qrResponse?.qr_data) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(qrResponse.qr_data);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = qrResponse.qr_data;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
      alert('Não foi possível copiar automaticamente. Selecione o código manualmente.');
    }
  };

  // Formatador de Moeda Real (BRL)
  const formatCurrency = (val: string | number | undefined) => {
    const num = typeof val === 'string' ? parseFloat(val) : typeof val === 'number' ? val : 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const progressPercent = (timeLeft / TOTAL_COUNTDOWN_SECONDS) * 100;
  const isTimeCritical = timeLeft < 120; // Menos de 2 minutos

  // TELA DE SUCESSO / CONFIRMAÇÃO DE PAGAMENTO
  if (isPaid) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          maxWidth: 480,
          mx: 'auto',
          textAlign: 'center',
          bgcolor: '#ffffff',
        }}
      >
        <Box sx={{ my: 2 }}>
          <CheckCircleIcon
            sx={{
              fontSize: 90,
              color: 'success.main',
              animation: 'popSuccess 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
          />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.dark', mb: 1 }}>
          Pagamento confirmado com sucesso! ✅
        </Typography>

        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Recebemos o seu pagamento via Pix Mercado Pago. A comanda foi atualizada.
        </Typography>

        {orderDetails && (
          <Box
            sx={{
              bgcolor: '#f4fbf6',
              border: '1px solid #c8e6c9',
              borderRadius: 2,
              p: 2,
              mb: 3,
              textAlign: 'left',
            }}
          >
            {orderDetails.tableNumber && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="textSecondary">Mesa:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Mesa {orderDetails.tableNumber}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="textSecondary">Comanda:</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                #{orderId.slice(0, 8).toUpperCase()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="textSecondary">Valor Pago:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {formatCurrency(orderDetails.totalAmount || qrResponse?.totalAmount)}
              </Typography>
            </Box>
          </Box>
        )}

        <Button
          variant="contained"
          color="success"
          fullWidth
          size="large"
          onClick={() => navigate('/mesas')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', py: 1.2 }}
        >
          Ir para Painel de Mesas
        </Button>

        <style>
          {`
            @keyframes popSuccess {
              0% { transform: scale(0.3); opacity: 0; }
              70% { transform: scale(1.15); opacity: 1; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}
        </style>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2.5, sm: 4 },
        borderRadius: 3,
        maxWidth: 480,
        mx: 'auto',
        bgcolor: '#ffffff',
        position: 'relative',
      }}
    >
      {/* Botão Voltar (se fornecido) */}
      {onBack && (
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          size="small"
          sx={{ mb: 1, textTransform: 'none', color: 'text.secondary' }}
        >
          Voltar
        </Button>
      )}

      {/* Cabeçalho */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
          <QrCode2Icon color="primary" sx={{ fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a1a1a' }}>
            Pagamento via Pix
          </Typography>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
          Mercado Pago • Transação Segura e Instantânea
        </Typography>
      </Box>

      {/* Loading inicial */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
          <CircularProgress size={45} />
          <Typography variant="body2" color="textSecondary">
            Gerando QR Code Pix dinâmico...
          </Typography>
        </Box>
      )}

      {/* Erro de geração */}
      {error && !loading && (
        <Box sx={{ my: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            variant="contained"
            fullWidth
            startIcon={<RefreshIcon />}
            onClick={generateQrCode}
            sx={{ textTransform: 'none' }}
          >
            Tentar novamente
          </Button>
        </Box>
      )}

      {/* Conteúdo com QR Code e Contagem */}
      {!loading && !error && qrResponse && (
        <Box>
          {/* Card de Valor Total e Mesa */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
              mb: 2.5,
            }}
          >
            <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Valor a pagar
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: '800', color: 'primary.main', my: 0.5 }}
            >
              {formatCurrency(qrResponse.totalAmount)}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 0.5 }}>
              {qrResponse.tableNumber && (
                <Chip
                  size="small"
                  label={`Mesa ${qrResponse.tableNumber}`}
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              <Chip
                size="small"
                label={`Comanda #${orderId.slice(0, 6).toUpperCase()}`}
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Cronômetro Regressivo (Regra dos 10 minutos) */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon
                  fontSize="small"
                  sx={{ color: isExpired ? 'error.main' : isTimeCritical ? 'warning.main' : 'primary.main' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {isExpired ? 'QR Code expirado' : 'Tempo para pagamento:'}
                </Typography>
              </Box>

              <Chip
                size="small"
                label={formatTime(timeLeft)}
                color={isExpired ? 'error' : isTimeCritical ? 'warning' : 'primary'}
                sx={{
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              />
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercent}
              color={isExpired ? 'error' : isTimeCritical ? 'warning' : 'primary'}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>

          {/* Área do QR Code / Estado de Expiração */}
          {isExpired ? (
            /* SE O CRONÔMETRO ATINGIR 00:00 (Passou dos 10 minutos) */
            <Box
              sx={{
                p: 3,
                border: '2px dashed #f87171',
                borderRadius: 2,
                bgcolor: '#fff1f2',
                textAlign: 'center',
                my: 2,
              }}
            >
              <WarningAmberIcon sx={{ fontSize: 56, color: 'error.main', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'error.dark', mb: 1 }}>
                O tempo para este QR Code expirou por segurança.
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
                Para evitar pagamentos fora do prazo de validade, solicite a emissão de um novo código.
              </Typography>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<RefreshIcon />}
                onClick={generateQrCode}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 2,
                }}
              >
                Solicitar novo pagamento / Gerar novo QR Code
              </Button>
            </Box>
          ) : (
            /* ENQUANTO ESTIVER DENTRO DOS 10 MINUTOS */
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'inline-block',
                  p: 2,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  mb: 2,
                }}
              >
                <img
                  src={qrResponse.qrCodeBase64}
                  alt="QR Code Pix"
                  style={{
                    width: '230px',
                    height: '230px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
              </Box>

              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                Abra o app do seu banco, escolha <strong>Pix</strong> e aponte a câmera para ler o código.
              </Typography>

              {/* Botão "Copiar código Pix" (Pix Copia e Cola) */}
              <Button
                variant={copied ? 'contained' : 'contained'}
                color={copied ? 'success' : 'primary'}
                fullWidth
                size="large"
                startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                onClick={handleCopyCode}
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  boxShadow: 1,
                  mb: 1.5,
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? 'Código Pix copiado! ✅' : 'Copiar código Pix (Copia e Cola)'}
              </Button>

              <Divider sx={{ my: 2 }} />

              {/* Indicador de Polling / Aguardando Confirmação */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.2,
                  p: 1.2,
                  bgcolor: '#f0fdf4',
                  borderRadius: 1.5,
                  border: '1px solid #bbf7d0',
                }}
              >
                <CircularProgress size={16} color="success" />
                <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                  Aguardando confirmação do pagamento em tempo real...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Snackbar de Feedback de Cópia */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message="Código Pix copiado para a área de transferência!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};
