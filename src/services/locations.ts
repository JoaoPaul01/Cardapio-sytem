// Endpoints reais descobertos da aplicação API
export const locations = {
  login: 'auth/login',
  products: 'products',
  categories: 'categories',
  orders: 'orders',
  orderQrCode: (orderId: string) => `orders/${orderId}/qrcode-mercadopago`,
  orderById: (orderId: string) => `orders/${orderId}`,
  tables: 'tables',
  estoque: 'estoque',
  UPLOAD_URL: 'http://localhost:3333',
};
