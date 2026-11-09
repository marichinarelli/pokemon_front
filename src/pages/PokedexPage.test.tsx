import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('sem pokémons mostra a mensagem de Pokédex vazia', async () => {
    vi.mocked(listEntries).mockResolvedValue([])

    renderPage(<PokedexPage />, { path: '/', route: '/' })

    expect(await screen.findByText('Sua Pokédex está vazia')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('quando a lista falha mostra mensagem de erro', async () => {
    vi.mocked(listEntries).mockRejectedValue(new Error('rede'))

    renderPage(<PokedexPage />, { path: '/', route: '/' })

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar sua Pokédex')
  })

  it('digitar na busca mostra só os pokémons que combinam', async () => {
    const user = userEvent.setup()
    vi.mocked(listEntries).mockResolvedValue([
      makeEntry({ id: 'e1', nickname: 'Sparky' }),
      makeEntry({ id: 'e2', pokemonName: 'bulbasaur', types: ['grass', 'poison'] }),
    ])

    renderPage(<PokedexPage />, { path: '/', route: '/' })
    expect(await screen.findByRole('heading', { name: 'Sparky' })).toBeInTheDocument()

    await user.type(screen.getByLabelText('Buscar'), 'bulba')

    expect(screen.getByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sparky' })).toBeNull()
  })

  it('filtrar por tipo mostra só aquele tipo e avisa quando nada combina', async () => {
    const user = userEvent.setup()
    vi.mocked(listEntries).mockResolvedValue([
      makeEntry({ id: 'e1', nickname: 'Sparky' }),
      makeEntry({ id: 'e2', pokeapiId: 1, pokemonName: 'bulbasaur', types: ['grass', 'poison'] }),
    ])

    renderPage(<PokedexPage />, { path: '/', route: '/' })
    expect(await screen.findByRole('heading', { name: 'Sparky' })).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Tipo'), 'poison')

    expect(screen.getByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Sparky' })).toBeNull()

    await user.type(screen.getByLabelText('Buscar'), 'spar')

    expect(screen.getByText('Nenhum pokémon encontrado')).toBeInTheDocument()
  })
})
