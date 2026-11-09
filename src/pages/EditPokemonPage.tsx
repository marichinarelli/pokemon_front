import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { getEntry, updateEntry } from '../services/pokedex'
import { deletePhoto, uploadPhoto } from '../services/storage'
import type { PokedexEntry } from '../types'
import { validatePhoto } from '../lib/validatePhoto'

export function EditPokemonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [entry, setEntry] = useState<PokedexEntry | null | undefined>(undefined)
  const [nickname, setNickname] = useState('')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getEntry(id!).then((e) => {
      setEntry(e)
      setNickname(e?.nickname ?? '')
      setNotes(e?.notes ?? '')
    })
  }, [id])

  if (entry === undefined) {
    return <p className="dex-number py-12 text-center">Carregando...</p>
  }

  if (entry === null) {
    return <p className="dex-panel mx-auto max-w-sm p-8 text-center font-semibold">Pokémon não encontrado na sua Pokédex</p>
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const newPhotoUrl = photo && user ? await uploadPhoto(user.id, photo) : null
    await updateEntry(entry.id, {
      nickname: nickname.trim() || null,
      notes: notes.trim() || null,
      photoUrl: newPhotoUrl ?? entry.photoUrl,
    })
    if (newPhotoUrl && entry.photoUrl) {
      try {
        await deletePhoto(entry.photoUrl)
      } catch {
        /* ignora */
      }
    }
    navigate(`/pokemon/${entry.id}`)
  }

  return (
    <div className="dex-panel mx-auto max-w-xl p-6">
      <h1 className="dex-title mb-5 capitalize">{`Editar ${entry.pokemonName}`}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="dex-field">
          Apelido <input className="dex-input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <label className="dex-field">
          Notas <textarea className="dex-input min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <label className="dex-field">
          Nova foto (opcional){' '}
          <input
            type="file"
            accept="image/*"
            className="dex-input"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              const problem = file ? validatePhoto(file) : null
              if (problem) {
                setError(problem)
                setPhoto(null)
              } else {
                setError(null)
                setPhoto(file)
              }
            }}
          />
        </label>
        {error && <p role="alert" className="dex-alert">{error}</p>}
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="submit" className="dex-btn dex-btn-green">Salvar alterações</button>
          <Link to={`/pokemon/${entry.id}`} className="dex-btn dex-btn-ghost">Cancelar</Link>
        </div>
      </form>
    </div>
  )
}
