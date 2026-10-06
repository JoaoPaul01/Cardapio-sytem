import { lazy } from 'react';

// Lazy loading dos componentes para otimizar a performance
const Mesas = lazy(() => import('../pages/Mesas/Mesas'));
const Catalogo = lazy(() => import('../pages/Catalogo/Catalogo'));

export const appRoutes = [
  { 
    path: '/', 
    element: Mesas, 
    isPrivate: true 
  },
  { 
    path: '/catalogo', 
    element: Catalogo, 
    isPrivate: true 
  },
  {
    path: '/historico',
    element: lazy(() => import('../pages/Historico/Historico')),
    isPrivate: true
  },
  {
    path: '/estoque',
    element: lazy(() => import('../pages/Estoque/Estoque')),
    isPrivate: true
  },
  { 
    path: '/mesa/:id', 
    element: lazy(() => import('../pages/MesaView/MesaView')), 
    isPrivate: true,
    noLayout: true
  },
];
