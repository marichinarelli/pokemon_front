import { supabase } from '../lib/supabase'
import type { NewPokedexEntry, PokedexEntry, PokedexEntryUpdate } from '../types'

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

const TABLE = 'pokedex_entries'

export async function listEntries(): Promise<PokedexEntry[]> {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as PokedexRow[]).map(rowToEntry)
}

export async function getEntry(id: string): Promise<PokedexEntry | null> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? rowToEntry(data as PokedexRow) : null
}

export async function createEntry(input: NewPokedexEntry): Promise<PokedexEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      pokeapi_id: input.pokeapiId,
      pokemon_name: input.pokemonName,
      types: input.types,
      artwork_url: input.artworkUrl,
      nickname: input.nickname,
      photo_url: input.photoUrl,
      notes: input.notes,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToEntry(data as PokedexRow)
}

export async function updateEntry(id: string, changes: PokedexEntryUpdate): Promise<PokedexEntry> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ nickname: changes.nickname, photo_url: changes.photoUrl, notes: changes.notes })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return rowToEntry(data as PokedexRow)
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw new Error(error.message)
}
