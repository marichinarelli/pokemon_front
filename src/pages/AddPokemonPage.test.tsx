import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { PIKACHU_ARTWORK, pikachuPreview } from '../test/fixtures'
import { fetchPokemon } from '../services/pokeapi'
import { AddPokemonPage } from './AddPokemonPage'

vi.mock('../services/pokeapi')
vi.mock('../services/pokedex')

describe('AddPokemonPage', () => {
  it('buscar um pokémon existente mostra a prévia e o formulário', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPokemon).mockResolvedValue(pikachuPreview)

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'pikachu')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(fetchPokemon).toHaveBeenCalledWith('pikachu')
    expect(await screen.findByRole('img', { name: 'pikachu' })).toHaveAttribute('src', PIKACHU_ARTWORK)
    expect(screen.getByText('electric')).toBeInTheDocument()
    expect(screen.getByLabelText('Apelido')).toBeInTheDocument()
    expect(screen.getByLabelText('Notas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salvar na Pokédex' })).toBeInTheDocument()
  })
})
