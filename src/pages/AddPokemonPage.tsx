import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { validatePhoto } from '../lib/validatePhoto'
import { fetchPokemon } from '../services/pokeapi'
import { createEntry } from '../services/pokedex'
import { uploadPhoto } from '../services/storage'
import type { PokemonPreview } from '../types'

export function AddPokemonPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<PokemonPreview | null>(null)
  const [nickname, setNickname] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const problem = file ? validatePhoto(file) : null
    if (problem) {
      setError(problem)
      setPhoto(null)
    } else {
      setError(null)
      setPhoto(file ?? null)
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preview === null) return
    try {
      await createEntry({
        pokeapiId: preview.pokeapiId,
        pokemonName: preview.name,
        types: preview.types,
        artworkUrl: preview.artworkUrl,
        nickname: nickname.trim() || null,
        photoUrl: null,
        notes: notes.trim() || null,
      })
      navigate('/')
    } catch {
      setError('Não foi possível salvar. Tente novamente.')
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    try {
      const result = await fetchPokemon(query)
      if (result === null) {
        setError('Pokémon não encontrado')
        setPreview(null)
        return
      }
      setPreview(result)
    } catch {
      setError('Não foi possível buscar agora. Tente novamente.')
      setPreview(null)
    }
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
          <form onSubmit={handleSave}>
            <label>
              Apelido <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </label>
            <label>
              Notas <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <label>
              Foto (opcional) <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
            <button type="submit">Salvar na Pokédex</button>
          </form>
        </>
      )}
    </>
  )
}
