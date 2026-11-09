import type { PokemonPreview } from '../types'

const BASE_URL = 'https://pokeapi.co/api/v2/pokemon'

type PokeApiPokemon = {
  id: number
  name: string
  types: { type: { name: string } }[]
  sprites: { front_default: string | null; other?: { 'official-artwork'?: { front_default: string | null } } }
}

export async function fetchPokemon(query: string): Promise<PokemonPreview | null> {
  const response = await fetch(`${BASE_URL}/${query}`)
  const data = (await response.json()) as PokeApiPokemon
  return {
    pokeapiId: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    artworkUrl: data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default ?? '',
  }
}
