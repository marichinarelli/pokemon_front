import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderPage } from '../test/renderPage'
import { makeEntry } from '../test/fixtures'
import { getEntry } from '../services/pokedex'
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
})
