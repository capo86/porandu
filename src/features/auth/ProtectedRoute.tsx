import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

export default function ProtectedRoute() {
  const { session, loading, recovery } = useAuth()
  if (loading) return <div className="narrow-shell py-24 text-center text-muted" role="status">Comprobando tu sesión…</div>
  if (!session) return <Navigate to="/ingresar" replace />
  if (recovery) return <Navigate to="/recuperar/actualizar" replace />
  return <Outlet />
}
