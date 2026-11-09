import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { makeEntry } from '../test/fixtures'
import { getEntry, updateEntry } from '../services/pokedex'
import { deletePhoto, uploadPhoto } from '../services/storage'
import { EditPokemonPage } from './EditPokemonPage'

vi.mock('../services/pokedex')
vi.mock('../services/storage')

describe('EditPokemonPage', () => {
  it('abre o formulário com apelido e notas atuais', async () => {
    vi.mocked(getEntry).mockResolvedValue(
      makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro', photoUrl: 'https://cdn.test/antiga.png' }),
    )

    renderPage(<EditPokemonPage />, { path: '/pokemon/:id/editar', route: '/pokemon/entry-1/editar' })

    expect(await screen.findByLabelText('Apelido')).toHaveValue('Sparky')
    expect(screen.getByLabelText('Notas')).toHaveValue('Meu primeiro')
    expect(screen.getByLabelText('Nova foto (opcional)')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Editar pikachu' })).toBeInTheDocument()
  })

  it('salvar sem foto nova atualiza apelido e notas e volta ao detalhe', async () => {
    const user = userEvent.setup()
    vi.mocked(getEntry).mockResolvedValue(
      makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro', photoUrl: 'https://cdn.test/antiga.png' }),
    )
    vi.mocked(updateEntry).mockResolvedValue(makeEntry())

    renderPage(<EditPokemonPage />, { path: '/pokemon/:id/editar', route: '/pokemon/entry-1/editar' })

    const nickname = await screen.findByLabelText('Apelido')
    await user.clear(nickname)
    await user.type(nickname, 'Raio')
    await user.clear(screen.getByLabelText('Notas'))
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(updateEntry).toHaveBeenCalledWith('entry-1', {
      nickname: 'Raio',
      notes: null,
      photoUrl: 'https://cdn.test/antiga.png',
    })
    expect(uploadPhoto).not.toHaveBeenCalled()
    expect(deletePhoto).not.toHaveBeenCalled()
    expect(await screen.findByTestId('location')).toHaveTextContent('/pokemon/entry-1')
  })
})
