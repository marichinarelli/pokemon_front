import { describe, it, expect } from 'vitest'
import { filterEntries, uniqueTypes } from './filterEntries'
import { makeEntry } from '../test/fixtures'

describe('filterEntries', () => {
  const sparky = makeEntry({ id: 'e1', nickname: 'Sparky' })
  const bulba = makeEntry({ id: 'e2', pokemonName: 'bulbasaur', types: ['grass', 'poison'] })
  const entries = [sparky, bulba]

  it('filtra por texto no nome da espécie ou no apelido, sem diferenciar maiúsculas', () => {
    expect(filterEntries(entries, { text: 'SPAR', type: '' })).toEqual([sparky])
    expect(filterEntries(entries, { text: 'bulba', type: '' })).toEqual([bulba])
    expect(filterEntries(entries, { text: '  ', type: '' })).toEqual(entries)
  })

  it('filtra por tipo e combina com o texto', () => {
    expect(filterEntries(entries, { text: '', type: 'poison' })).toEqual([bulba])
    expect(filterEntries(entries, { text: 'spar', type: 'poison' })).toEqual([])
  })

  it('uniqueTypes devolve os tipos sem repetição em ordem alfabética', () => {
    const lista = [sparky, bulba, makeEntry({ id: 'e3', types: ['electric'] })]
    expect(uniqueTypes(lista)).toEqual(['electric', 'grass', 'poison'])
  })
})
