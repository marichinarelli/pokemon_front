import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { App } from './App'
import { getCurrentUser, onAuthChange } from './services/auth'
import { listEntries } from './services/pokedex'
import { testUser } from './test/fixtures'

vi.mock('./services/auth')
vi.mock('./services/pokedex')

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

  it('com sessão a rota inicial mostra a Pokédex do usuário', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(onAuthChange).mockReturnValue(() => {})
    vi.mocked(listEntries).mockResolvedValue([])

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Sua Pokédex está vazia')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  })
})
