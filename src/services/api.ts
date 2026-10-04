import axios from 'axios';

// Configuração básica do Axios
const api = axios.create({
  baseURL: 'http://localhost:3333/api/', // Apontando para o backend local novamente
  timeout: 10000,
});

// Intercepta todas as requisições para injetar o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@Cardapio:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
