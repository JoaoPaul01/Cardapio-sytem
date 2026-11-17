import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Button, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PixPaymentCard } from '../../components/PixPayment/PixPaymentCard';

export default function PagamentoPix() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f1f5f9',
        py: { xs: 3, sm: 6 },
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="text"
            sx={{ textTransform: 'none', color: '#475569', fontWeight: 600 }}
          >
            Voltar
          </Button>
        </Box>

        {!orderId ? (
          <Alert severity="error">
            ID do pedido não informado na URL.
          </Alert>
        ) : (
          <PixPaymentCard
            orderId={orderId}
            onBack={() => navigate(-1)}
            onSuccess={() => {
              console.log('Pagamento confirmado para o pedido:', orderId);
            }}
          />
        )}
      </Container>
    </Box>
  );
}
