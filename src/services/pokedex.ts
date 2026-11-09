import { supabase } from '../lib/supabase'
import type { PokedexEntry } from '../types'

export type PokedexRow = {
  id: string
  user_id: string
  pokeapi_id: number
  pokemon_name: string
  types: string[]
  artwork_url: string
  nickname: string | null
  photo_url: string | null
  notes: string | null
  created_at: string
}

export function rowToEntry(row: PokedexRow): PokedexEntry {
  return {
    id: row.id,
    userId: row.user_id,
    pokeapiId: row.pokeapi_id,
    pokemonName: row.pokemon_name,
    types: row.types,
    artworkUrl: row.artwork_url,
    nickname: row.nickname,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdAt: row.created_at,
  }
}
