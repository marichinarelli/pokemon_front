import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { validatePhoto } from '../lib/validatePhoto'
import { fetchPokemon } from '../services/pokeapi'
import { createEntry } from '../services/pokedex'
import { uploadPhoto } from '../services/storage'
import type { PokemonPreview } from '../types'
import { typeBackground, typeColor } from '../lib/typeColors'

export function AddPokemonPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      const photoUrl = photo && user ? await uploadPhoto(user.id, photo) : null
      await createEntry({
        pokeapiId: preview.pokeapiId,
        pokemonName: preview.name,
        types: preview.types,
        artworkUrl: preview.artworkUrl,
        nickname: nickname.trim() || null,
        photoUrl,
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
    <div className="mx-auto max-w-3xl">
      <h1 className="dex-title mb-5">Adicionar pokémon</h1>
      <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
        <label className="dex-field min-w-0 flex-1">
          Nome ou número <input className="dex-input" placeholder="pikachu ou 25" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button type="submit" className="dex-btn">Buscar</button>
      </form>
      {error && <p role="alert" className="dex-alert mt-4">{error}</p>}
      {preview && (
        <div className="dex-panel mt-6 grid overflow-hidden sm:grid-cols-[16rem_1fr]">
          <div className="dex-art min-h-56 p-4" style={{ background: typeBackground(preview.types) }}>
            <span className="dex-number absolute left-3 top-3 rounded bg-white/85 px-1.5 text-xs">
              #{String(preview.pokeapiId).padStart(3, '0')}
            </span>
            <img src={preview.artworkUrl} alt={preview.name} className="h-44 w-44 object-contain" />
          </div>
          <div className="flex flex-col gap-4 border-t-3 border-dex-bezel p-5 sm:border-l-3 sm:border-t-0">
            <div>
              <h2 className="text-2xl font-bold capitalize">{preview.name}</h2>
              <ul className="mt-2 flex flex-wrap gap-1">
                {preview.types.map((type) => (
                  <li key={type} className="dex-type" style={{ background: typeColor(type) }}>{type}</li>
                ))}
              </ul>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <label className="dex-field">
                Apelido <input className="dex-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
              </label>
              <label className="dex-field">
                Notas <textarea className="dex-input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
              <label className="dex-field">
                Foto (opcional) <input type="file" accept="image/*" className="dex-input" onChange={handlePhotoChange} />
              </label>
              <button type="submit" className="dex-btn dex-btn-green self-start">Salvar na Pokédex</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
