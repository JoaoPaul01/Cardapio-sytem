import axios from 'axios';

// Configuração básica do Axios
const api = axios.create({
  baseURL: 'https://cardapio-sytem-api.onrender.com/api/', // Apontando para o backend na nuvem
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
