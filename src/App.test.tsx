import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { App } from './App'
import { getCurrentUser, onAuthChange } from './services/auth'

vi.mock('./services/auth')

describe('App', () => {
  it('sem sessão a rota inicial mostra a tela de login', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null)
    vi.mocked(onAuthChange).mockReturnValue(() => {})

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})
