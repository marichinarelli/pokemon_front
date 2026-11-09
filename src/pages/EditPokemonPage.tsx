import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getEntry, updateEntry } from '../services/pokedex'
import type { PokedexEntry } from '../types'

export function EditPokemonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
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
    return <p>Carregando...</p>
  }

  if (entry === null) {
    return <p>Pokémon não encontrado na sua Pokédex</p>
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await updateEntry(entry.id, {
      nickname: nickname.trim() || null,
      notes: notes.trim() || null,
      photoUrl: entry.photoUrl,
    })
    navigate(`/pokemon/${entry.id}`)
  }

  return (
    <>
      <h1 className="capitalize">{`Editar ${entry.pokemonName}`}</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Apelido <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <label>
          Notas <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        <label>
          Nova foto (opcional) <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit">Salvar alterações</button>
        <Link to={`/pokemon/${entry.id}`}>Cancelar</Link>
      </form>
      {error && <p role="alert">{error}</p>}
    </>
  )
}
