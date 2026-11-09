import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteEntry, getEntry } from '../services/pokedex'
import { deletePhoto } from '../services/storage'
import { typeBackground, typeColor } from '../lib/typeColors'
import type { PokedexEntry } from '../types'

export function PokemonDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<PokedexEntry | null | undefined>(undefined)

  useEffect(() => {
    getEntry(id!).then(setEntry)
  }, [id])

  async function handleDelete() {
    if (!entry) return
    if (!window.confirm('Excluir este pokémon da sua Pokédex?')) return
    await deleteEntry(entry.id)
    if (entry.photoUrl) {
      try { await deletePhoto(entry.photoUrl) } catch { /* foto órfã é aceitável */ }
    }
    navigate('/')
  }

  if (entry === undefined) {
    return <p className="dex-number py-12 text-center">Carregando...</p>
  }

  if (entry === null) {
    return (
      <div className="dex-panel mx-auto flex max-w-sm flex-col items-center gap-4 p-8 text-center">
        <p className="font-semibold">Pokémon não encontrado na sua Pokédex</p>
        <Link to="/" className="dex-btn">Voltar para a Pokédex</Link>
      </div>
    )
  }

  const title = entry.nickname ?? entry.pokemonName

  return (
    <div className="mx-auto max-w-4xl">
      <div className="dex-panel grid overflow-hidden md:grid-cols-2">
        <div className="dex-art min-h-72 p-6" style={{ background: typeBackground(entry.types) }}>
          <img
            src={entry.photoUrl ?? entry.artworkUrl}
            alt={title}
            className={entry.photoUrl ? 'h-56 w-56 rounded-full border-8 border-white object-cover' : 'h-64 w-64 object-contain'}
          />
        </div>
        <div className="flex flex-col gap-4 border-t-3 border-dex-bezel p-6 md:border-l-3 md:border-t-0">
          <p className="dex-number text-lg">#{String(entry.pokeapiId).padStart(3, '0')}</p>
          <h1 className="-mt-3 text-3xl font-bold capitalize">{title}</h1>
          {entry.nickname && <p className="-mt-2 capitalize text-gray-500">Espécie: {entry.pokemonName}</p>}
          <ul className="flex flex-wrap gap-1.5">
            {entry.types.map((type) => (
              <li key={type} className="dex-type px-3 py-1 text-sm" style={{ background: typeColor(type) }}>{type}</li>
            ))}
          </ul>
          {entry.notes && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-dex-screen p-3">
              <p className="dex-field mb-1">Notas</p>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </div>
          )}
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Link to={`/pokemon/${entry.id}/editar`} className="dex-btn">Editar</Link>
            <button type="button" className="dex-btn dex-btn-red" onClick={handleDelete}>Excluir</button>
          </div>
        </div>
      </div>
      <Link to="/" className="dex-btn dex-btn-ghost mt-5">Voltar para a Pokédex</Link>
    </div>
  )
}
