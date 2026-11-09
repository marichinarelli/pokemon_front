import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { fetchPokemon } from './pokeapi'
import { server } from '../test/msw'
import { PIKACHU_ARTWORK, pikachuPreview } from '../test/fixtures'

const pikachuResponse = {
  id: 25,
  name: 'pikachu',
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  sprites: { front_default: 'x', other: { 'official-artwork': { front_default: PIKACHU_ARTWORK } } },
}

describe('pokeapi', () => {
  it('fetchPokemon devolve id, nome, tipos e arte oficial', async () => {
    server.use(http.get('https://pokeapi.co/api/v2/pokemon/:query', () => HttpResponse.json(pikachuResponse)))

    const result = await fetchPokemon('pikachu')

    expect(result).toEqual(pikachuPreview)
  })

  it('fetchPokemon devolve null quando a PokéAPI responde 404', async () => {
    server.use(http.get('https://pokeapi.co/api/v2/pokemon/:query', () => new HttpResponse('Not Found', { status: 404 })))

    const result = await fetchPokemon('naoexiste')

    expect(result).toBeNull()
  })
})
