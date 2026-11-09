import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { PokedexPage } from './pages/PokedexPage'
import { AddPokemonPage } from './pages/AddPokemonPage'
import { PokemonDetailPage } from './pages/PokemonDetailPage'
import { EditPokemonPage } from './pages/EditPokemonPage'

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<PokedexPage />} />
        <Route path="/adicionar" element={<AddPokemonPage />} />
        <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
        <Route path="/pokemon/:id/editar" element={<EditPokemonPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
