import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderPage } from '../test/renderPage'
import { makeEntry } from '../test/fixtures'
import { listEntries } from '../services/pokedex'
import { PokedexPage } from './PokedexPage'

vi.mock('../services/pokedex')

describe('PokedexPage', () => {
  it('mostra um card para cada pokémon da coleção', async () => {
    vi.mocked(listEntries).mockResolvedValue([
      makeEntry({ id: 'e1', nickname: 'Sparky' }),
      makeEntry({ id: 'e2', pokeapiId: 1, pokemonName: 'bulbasaur', types: ['grass', 'poison'], artworkUrl: 'https://example.com/1.png' }),
    ])

    renderPage(<PokedexPage />, { path: '/', route: '/' })

    expect(await screen.findByRole('heading', { name: 'Sparky' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Minha Pokédex' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Adicionar pokémon' })).toHaveAttribute('href', '/adicionar')
  })
})
