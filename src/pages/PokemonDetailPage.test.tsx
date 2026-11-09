import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { makeEntry } from '../test/fixtures'
import { deleteEntry, getEntry } from '../services/pokedex'
import { deletePhoto } from '../services/storage'
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

  it('excluir confirmado apaga a entrada e a foto e volta para a lista', async () => {
    const user = userEvent.setup()
    vi.mocked(getEntry).mockResolvedValue(makeEntry({ photoUrl: 'https://cdn.test/foto.png' }))
    vi.mocked(deleteEntry).mockResolvedValue(undefined)
    vi.mocked(deletePhoto).mockResolvedValue(undefined)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderPage(<PokemonDetailPage />, { path: '/pokemon/:id', route: '/pokemon/entry-1' })

    await user.click(await screen.findByRole('button', { name: 'Excluir' }))

    expect(confirmSpy).toHaveBeenCalledWith('Excluir este pokémon da sua Pokédex?')
    expect(deleteEntry).toHaveBeenCalledWith('entry-1')
    expect(deletePhoto).toHaveBeenCalledWith('https://cdn.test/foto.png')
    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('id inexistente mostra aviso e link para voltar', async () => {
    vi.mocked(getEntry).mockResolvedValue(null)

    renderPage(<PokemonDetailPage />, { path: '/pokemon/:id', route: '/pokemon/nao-existe' })

    expect(await screen.findByText('Pokémon não encontrado na sua Pokédex')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Voltar para a Pokédex' })).toHaveAttribute('href', '/')
  })
})
