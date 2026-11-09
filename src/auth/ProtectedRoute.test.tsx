import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthContext } from './AuthProvider'
import { ProtectedRoute } from './ProtectedRoute'
import type { AppUser } from '../types'

function renderProtected(user: AppUser | null) {
  return render(
    <AuthContext.Provider value={{ user, loading: false, signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn() }}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>conteúdo protegido</p>} />
          </Route>
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('sem usuário redireciona para o login', () => {
    renderProtected(null)

    expect(screen.getByText('tela de login')).toBeInTheDocument()
    expect(screen.queryByText('conteúdo protegido')).toBeNull()
  })
})
