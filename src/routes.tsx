import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
import RouteError from '@/components/RouteError'
import LoadingView from '@/components/LoadingView'

export const router = createBrowserRouter([
  {
    path: '/', Component: Layout, ErrorBoundary: RouteError, HydrateFallback: LoadingView,
    children: [
      { index: true, lazy: () => import('@/pages/HomePage') },
      { path: 'tests/:code', lazy: () => import('@/pages/TestDetailPage') },
      { path: 'tests/:code/datos', lazy: () => import('@/pages/PatientPage') },
      { path: 'intento', lazy: () => import('@/pages/AttemptPage') },
      { path: 'retomar', lazy: () => import('@/pages/ResumePage') },
      { path: 'privacidad', lazy: () => import('@/pages/PrivacyPage') },
      { path: '*', lazy: () => import('@/pages/NotFoundPage') },
    ],
  },
])
