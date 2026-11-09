export type AppUser = { id: string; email: string }

export type PokemonPreview = {
  pokeapiId: number
  name: string
  types: string[]
  artworkUrl: string
}

export type PokedexEntry = {
  id: string
  userId: string
  pokeapiId: number
  pokemonName: string
  types: string[]
  artworkUrl: string
  nickname: string | null
  photoUrl: string | null
  notes: string | null
  createdAt: string
}

export type NewPokedexEntry = Omit<PokedexEntry, 'id' | 'userId' | 'createdAt'>

export type PokedexEntryUpdate = Pick<PokedexEntry, 'nickname' | 'photoUrl' | 'notes'>
