import React, { createContext, useContext, type ReactNode, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

interface AppContextProps {
  user: any;
  isAuthenticated: boolean;
  authenticate: (endpoint: string, data: any) => Promise<any>;
  logout: () => void;
  getData: (endpoint: string, params?: any) => Promise<any>;
  postData: (endpoint: string, data: any) => Promise<any>;
  putData: (endpoint: string, data: any) => Promise<any>;
  patchData: (endpoint: string, data: any) => Promise<any>;
  removeData: (endpoint: string) => Promise<any>;
  uploadImageData: (endpoint: string, file: File) => Promise<any>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializa de forma síncrona lendo do localStorage para não perder a sessão no refresh (f5)
  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem('@Cardapio:user');
    const storedToken = localStorage.getItem('@Cardapio:token');
    if (storedUser && storedToken) {
      return JSON.parse(storedUser);
    }
    return null;
  });

  // Mantemos o useEffect só por segurança caso precise de alguma lógica extra depois
  useEffect(() => {
    const storedUser = localStorage.getItem('@Cardapio:user');
    if (!storedUser) {
      setUser(null);
    }
  }, []);

  // LOGIN (salva token e user no localStorage para manter a sessão)
  const authenticate = async (endpoint: string, data: any) => {
    const response = await api.post(endpoint, data);
    
    // ATENÇÃO: Dependendo de como a sua API retornar, ajuste os campos abaixo.
    // Estamos assumindo que a API retorna algo como { user: {...}, token: "..." }
    const { user, token } = response.data;

    localStorage.setItem('@Cardapio:token', token);
    localStorage.setItem('@Cardapio:user', JSON.stringify(user));
    
    setUser(user);
    return response.data;
  };

  // LOGOUT (limpa tudo e remove o usuário do state)
  const logout = () => {
    localStorage.removeItem('@Cardapio:token');
    localStorage.removeItem('@Cardapio:user');
    setUser(null);
  };

  // GET
  const getData = useCallback(async (endpoint: string, params?: any) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  }, []);

  // POST
  const postData = useCallback(async (endpoint: string, data: any) => {
    const response = await api.post(endpoint, data);
    return response.data;
  }, []);

  // PUT
  const putData = useCallback(async (endpoint: string, data: any) => {
    const response = await api.put(endpoint, data);
    return response.data;
  }, []);

  // PATCH
  const patchData = useCallback(async (endpoint: string, data: any) => {
    const response = await api.patch(endpoint, data);
    return response.data;
  }, []);

  // DELETE
  const removeData = useCallback(async (endpoint: string) => {
    const response = await api.delete(endpoint);
    return response.data;
  }, []);

  // UPLOAD DE IMAGEM
  const uploadImageData = async (endpoint: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  const isAuthenticated = !!user; // Retorna true se houver usuário no state

  return (
    <AppContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        authenticate, 
        logout, 
        getData, 
        postData, 
        putData,
        patchData, 
        removeData, 
        uploadImageData 
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
