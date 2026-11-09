import { Navigate, Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { DexScreen } from '../components/DexDevice'
import { useAuth } from './AuthProvider'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-8 text-center font-semibold text-white">Carregando...</p>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="dex-shell">
      <Header />
      <DexScreen>
        <main>
          <Outlet />
        </main>
      </DexScreen>
    </div>
  )
}
