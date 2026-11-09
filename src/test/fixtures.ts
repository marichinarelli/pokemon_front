import type { AppUser, PokedexEntry, PokemonPreview } from '../types'

export const PIKACHU_ARTWORK =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'

export const testUser: AppUser = { id: 'user-1', email: 'ash@pallet.com' }

export const pikachuPreview: PokemonPreview = {
  pokeapiId: 25,
  name: 'pikachu',
  types: ['electric'],
  artworkUrl: PIKACHU_ARTWORK,
}

export function makeEntry(overrides: Partial<PokedexEntry> = {}): PokedexEntry {
  return {
    id: 'entry-1',
    userId: 'user-1',
    pokeapiId: 25,
    pokemonName: 'pikachu',
    types: ['electric'],
    artworkUrl: PIKACHU_ARTWORK,
    nickname: null,
    photoUrl: null,
    notes: null,
    createdAt: '2026-11-09T12:00:00.000Z',
    ...overrides,
  }
}
