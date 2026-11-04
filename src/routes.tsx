import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
import RouteError from '@/components/RouteError'
import LoadingView from '@/components/LoadingView'
import ProtectedRoute from '@/features/auth/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/', Component: Layout, ErrorBoundary: RouteError, HydrateFallback: LoadingView,
    children: [
      { index: true, lazy: () => import('@/pages/HomePage') },
      { path: 'tests/:code', lazy: () => import('@/pages/TestDetailPage') },
      { path: 'tests/:code/datos', lazy: () => import('@/pages/TestDetailPage') },
      { path: 'ingresar', lazy: () => import('@/pages/LoginPage') },
      { path: 'recuperar', lazy: () => import('@/pages/ForgotPasswordPage') },
      { path: 'recuperar/actualizar', lazy: () => import('@/pages/UpdatePasswordPage') },
      { Component: ProtectedRoute, children: [{ path: 'profesional', lazy: () => import('@/pages/ProfessionalPage') }] },
      { path: 'intento', lazy: () => import('@/pages/AttemptPage') },
      { path: 'retomar', lazy: () => import('@/pages/ResumePage') },
      { path: 'privacidad', lazy: () => import('@/pages/PrivacyPage') },
      { path: '*', lazy: () => import('@/pages/NotFoundPage') },
    ],
  },
])
