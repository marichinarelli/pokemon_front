import { describe, it, expect } from 'vitest'
import { filterEntries } from './filterEntries'
import { makeEntry } from '../test/fixtures'

describe('filterEntries', () => {
  it('filtra por texto no nome da espécie ou no apelido, sem diferenciar maiúsculas', () => {
    const sparky = makeEntry({ id: 'e1', nickname: 'Sparky' })
    const bulba = makeEntry({ id: 'e2', pokemonName: 'bulbasaur', types: ['grass', 'poison'] })
    const entries = [sparky, bulba]

    expect(filterEntries(entries, { text: 'SPAR', type: '' })).toEqual([sparky])
    expect(filterEntries(entries, { text: 'bulba', type: '' })).toEqual([bulba])
    expect(filterEntries(entries, { text: '  ', type: '' })).toEqual(entries)
  })
})
