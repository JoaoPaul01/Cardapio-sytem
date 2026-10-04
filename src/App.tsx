import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppContext } from './context/appContext';
import { Login } from './pages/Login';
import { appRoutes } from './router/router';
import { Layout } from './components/Layout/Layout';
import './App.css';

// Componente para proteger as rotas privadas
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver logado, envolve a tela com o Layout padrão (Sidebar)
  return <Layout>{children}</Layout>;
};

// Componente de Loading para o Lazy Load
const FallbackLoading = () => (
  <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FallbackLoading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {appRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.isPrivate ? (
                  <PrivateRoute>
                    <route.element />
                  </PrivateRoute>
                ) : (
                  <route.element />
                )
              }
            />
          ))}
          
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
