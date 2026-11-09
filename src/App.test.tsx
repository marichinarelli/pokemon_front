import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { App } from './App'
import { getCurrentUser, onAuthChange } from './services/auth'
import { getEntry, listEntries } from './services/pokedex'
import { makeEntry, testUser } from './test/fixtures'

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

  it('com sessão a rota /adicionar mostra a tela de adicionar', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(onAuthChange).mockReturnValue(() => {})

    render(
      <MemoryRouter initialEntries={['/adicionar']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Adicionar pokémon' })).toBeInTheDocument()
  })

  it('com sessão a rota /pokemon/:id mostra o detalhe', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(onAuthChange).mockReturnValue(() => {})
    vi.mocked(getEntry).mockResolvedValue(makeEntry({ nickname: 'Sparky' }))

    render(
      <MemoryRouter initialEntries={['/pokemon/entry-1']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Sparky' })).toBeInTheDocument()
  })
})
