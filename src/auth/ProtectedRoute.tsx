import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { useAuth } from './AuthProvider'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <p>Carregando...</p>
  if (!user) return <Navigate to="/login" replace />

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </>
  )
}
