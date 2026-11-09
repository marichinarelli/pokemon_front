import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { PIKACHU_ARTWORK, makeEntry, pikachuPreview } from '../test/fixtures'
import { fetchPokemon } from '../services/pokeapi'
import { createEntry } from '../services/pokedex'
import { uploadPhoto } from '../services/storage'
import { AddPokemonPage } from './AddPokemonPage'

vi.mock('../services/pokeapi')
vi.mock('../services/pokedex')
vi.mock('../services/storage')

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

  it('buscar um pokémon inexistente mostra Pokémon não encontrado', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPokemon).mockResolvedValue(null)

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'naoexiste')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Pokémon não encontrado')
    expect(screen.queryByRole('button', { name: 'Salvar na Pokédex' })).toBeNull()
  })

  it('salvar cria a entrada com os dados do pokémon e volta para a lista', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPokemon).mockResolvedValue(pikachuPreview)
    vi.mocked(createEntry).mockResolvedValue(makeEntry())

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'pikachu')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByRole('img', { name: 'pikachu' })

    await user.type(screen.getByLabelText('Apelido'), 'Sparky')
    await user.type(screen.getByLabelText('Notas'), 'Meu primeiro')
    await user.click(screen.getByRole('button', { name: 'Salvar na Pokédex' }))

    expect(createEntry).toHaveBeenCalledWith({
      pokeapiId: 25,
      pokemonName: 'pikachu',
      types: ['electric'],
      artworkUrl: PIKACHU_ARTWORK,
      nickname: 'Sparky',
      photoUrl: null,
      notes: 'Meu primeiro',
    })
    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('quando salvar falha mostra erro e continua na página', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPokemon).mockResolvedValue(pikachuPreview)
    vi.mocked(createEntry).mockRejectedValue(new Error('rede'))

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'pikachu')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByRole('img', { name: 'pikachu' })

    await user.click(screen.getByRole('button', { name: 'Salvar na Pokédex' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar. Tente novamente.')
    expect(screen.queryByTestId('location')).toBeNull()
  })

  it('foto que não é imagem mostra erro e não é enviada', async () => {
    const user = userEvent.setup({ applyAccept: false })
    vi.mocked(fetchPokemon).mockResolvedValue(pikachuPreview)
    vi.mocked(createEntry).mockResolvedValue(makeEntry())

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'pikachu')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByRole('img', { name: 'pikachu' })

    await user.upload(
      screen.getByLabelText('Foto (opcional)'),
      new File(['x'], 'doc.pdf', { type: 'application/pdf' }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Envie um arquivo de imagem')

    await user.click(screen.getByRole('button', { name: 'Salvar na Pokédex' }))

    expect(uploadPhoto).not.toHaveBeenCalled()
    expect(createEntry).toHaveBeenCalledWith(expect.objectContaining({ photoUrl: null }))
  })

  it('foto válida é enviada e a URL vai para a entrada', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPokemon).mockResolvedValue(pikachuPreview)
    vi.mocked(createEntry).mockResolvedValue(makeEntry())
    vi.mocked(uploadPhoto).mockResolvedValue('https://cdn.test/user-1/abc.png')

    renderPage(<AddPokemonPage />, { path: '/adicionar', route: '/adicionar' })

    await user.type(screen.getByLabelText('Nome ou número'), 'pikachu')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    await screen.findByRole('img', { name: 'pikachu' })

    const photo = new File(['img'], 'foto.png', { type: 'image/png' })
    await user.upload(screen.getByLabelText('Foto (opcional)'), photo)
    await user.click(screen.getByRole('button', { name: 'Salvar na Pokédex' }))

    expect(uploadPhoto).toHaveBeenCalledWith('user-1', photo)
    expect(createEntry).toHaveBeenCalledWith(
      expect.objectContaining({ photoUrl: 'https://cdn.test/user-1/abc.png' }),
    )
    expect(await screen.findByTestId('location')).toHaveTextContent(/^\/$/)
  })
})
