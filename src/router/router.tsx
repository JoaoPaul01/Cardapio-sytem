import { lazy } from 'react';

// Lazy loading dos componentes para otimizar a performance
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Catalogo = lazy(() => import('../pages/Catalogo/Catalogo'));

export const appRoutes = [
  { 
    path: '/', 
    element: Dashboard, 
    isPrivate: true 
  },
  { 
    path: '/catalogo', 
    element: Catalogo, 
    isPrivate: true 
  },
];
