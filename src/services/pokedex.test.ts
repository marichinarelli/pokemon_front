import { describe, it, expect } from 'vitest'
import { rowToEntry } from './pokedex'
import { PIKACHU_ARTWORK, makeEntry } from '../test/fixtures'

describe('pokedex', () => {
  it('rowToEntry converte colunas snake_case em PokedexEntry', () => {
    const row = {
      id: 'entry-1',
      user_id: 'user-1',
      pokeapi_id: 25,
      pokemon_name: 'pikachu',
      types: ['electric'],
      artwork_url: PIKACHU_ARTWORK,
      nickname: 'Sparky',
      photo_url: null,
      notes: 'Meu primeiro',
      created_at: '2026-11-09T12:00:00.000Z',
    }

    expect(rowToEntry(row)).toEqual(makeEntry({ nickname: 'Sparky', notes: 'Meu primeiro' }))
  })
})
