import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PokemonCard } from './PokemonCard'
import { PIKACHU_ARTWORK, makeEntry } from '../test/fixtures'

describe('PokemonCard', () => {
  it('com apelido e foto mostra o apelido, a espécie, os tipos e a foto própria', () => {
    const entry = makeEntry({ nickname: 'Sparky', photoUrl: 'https://example.com/foto.jpg' })

    render(
      <MemoryRouter>
        <PokemonCard entry={entry} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Sparky' })).toBeInTheDocument()
    expect(screen.getByText('pikachu')).toBeInTheDocument()
    expect(screen.getByText('electric')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Sparky' })).toHaveAttribute('src', 'https://example.com/foto.jpg')
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pokemon/entry-1')
  })

  it('sem apelido e sem foto mostra o nome da espécie e a arte oficial', () => {
    const entry = makeEntry()

    render(
      <MemoryRouter>
        <PokemonCard entry={entry} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
    expect(screen.getAllByText('pikachu')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'pikachu' })).toHaveAttribute('src', PIKACHU_ARTWORK)
  })
})
