import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteEntry, getEntry } from '../services/pokedex'
import { deletePhoto } from '../services/storage'
import { typeColor } from '../lib/typeColors'
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
    return <p>Carregando...</p>
  }

  if (entry === null) {
    return (
      <>
        <p>Pokémon não encontrado na sua Pokédex</p>
        <Link to="/">Voltar para a Pokédex</Link>
      </>
    )
  }

  const title = entry.nickname ?? entry.pokemonName

  return (
    <>
      <img src={entry.photoUrl ?? entry.artworkUrl} alt={title} />
      <h1 className="capitalize">{title}</h1>
      {entry.nickname && <p>Espécie: {entry.pokemonName}</p>}
      <p>#{String(entry.pokeapiId).padStart(3, '0')}</p>
      <ul>
        {entry.types.map((type) => (
          <li key={type} className={typeColor(type)}>{type}</li>
        ))}
      </ul>
      {entry.notes && <p>{entry.notes}</p>}
      <Link to={`/pokemon/${entry.id}/editar`}>Editar</Link>
      <button type="button" onClick={handleDelete}>Excluir</button>
      <Link to="/">Voltar para a Pokédex</Link>
    </>
  )
}
