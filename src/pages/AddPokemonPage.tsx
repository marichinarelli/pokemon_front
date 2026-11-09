import { useState } from 'react'
import type { FormEvent } from 'react'
import { fetchPokemon } from '../services/pokeapi'
import type { PokemonPreview } from '../types'

export function AddPokemonPage() {
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<PokemonPreview | null>(null)
  const [nickname, setNickname] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const result = await fetchPokemon(query)
    setPreview(result)
  }

  return (
    <>
      <h1>Adicionar pokémon</h1>
      <form onSubmit={handleSearch}>
        <label>
          Nome ou número <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="submit">Buscar</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {preview && (
        <>
          <img src={preview.artworkUrl} alt={preview.name} />
          <h2 className="capitalize">{preview.name}</h2>
          <ul>
            {preview.types.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
          <form>
            <label>
              Apelido <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </label>
            <label>
              Notas <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button type="submit">Salvar na Pokédex</button>
          </form>
        </>
      )}
    </>
  )
}
