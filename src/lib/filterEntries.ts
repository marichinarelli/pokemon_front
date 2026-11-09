import type { PokedexEntry } from '../types'

export type EntryFilters = { text: string; type: string }

export function filterEntries(entries: PokedexEntry[], filters: EntryFilters): PokedexEntry[] {
  const text = filters.text.trim().toLowerCase()
  return entries.filter((entry) => {
    const matchesText =
      text === '' ||
      entry.pokemonName.toLowerCase().includes(text) ||
      (entry.nickname ?? '').toLowerCase().includes(text)
    const matchesType = filters.type === '' || entry.types.includes(filters.type)
    return matchesText && matchesType
  })
}

export function uniqueTypes(entries: PokedexEntry[]): string[] {
  return [...new Set(entries.flatMap((e) => e.types))].sort()
}
