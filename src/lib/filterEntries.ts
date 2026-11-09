import type { PokedexEntry } from '../types'

export type EntryFilters = { text: string; type: string }

export function filterEntries(entries: PokedexEntry[], filters: EntryFilters): PokedexEntry[] {
  const text = filters.text.trim().toLowerCase()
  return entries.filter((entry) => {
    const matchesText =
      text === '' ||
      entry.pokemonName.toLowerCase().includes(text) ||
      (entry.nickname ?? '').toLowerCase().includes(text)
    return matchesText
  })
}
