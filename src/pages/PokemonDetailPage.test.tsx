import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderPage } from '../test/renderPage'
import { makeEntry } from '../test/fixtures'
import { getEntry } from '../services/pokedex'
import { PokemonDetailPage } from './PokemonDetailPage'

vi.mock('../services/pokedex')
vi.mock('../services/storage')

describe('PokemonDetailPage', () => {
  it('mostra foto, apelido, espécie, número, tipos e notas', async () => {
    vi.mocked(getEntry).mockResolvedValue(
      makeEntry({ nickname: 'Sparky', photoUrl: 'https://example.com/foto.jpg', notes: 'Meu primeiro' }),
    )

    renderPage(<PokemonDetailPage />, { path: '/pokemon/:id', route: '/pokemon/entry-1' })

    expect(getEntry).toHaveBeenCalledWith('entry-1')
    expect(await screen.findByRole('heading', { name: 'Sparky' })).toBeInTheDocument()
    expect(screen.getByText('Espécie: pikachu')).toBeInTheDocument()
    expect(screen.getByText('#025')).toBeInTheDocument()
    expect(screen.getByText('electric')).toBeInTheDocument()
    expect(screen.getByText('Meu primeiro')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sparky' })).toHaveAttribute('src', 'https://example.com/foto.jpg')
    expect(screen.getByRole('link', { name: 'Editar' })).toHaveAttribute('href', '/pokemon/entry-1/editar')
  })
})
