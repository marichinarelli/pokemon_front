import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PokemonCard } from '../components/PokemonCard'
import { listEntries } from '../services/pokedex'
import type { PokedexEntry } from '../types'

export function PokedexPage() {
  const [entries, setEntries] = useState<PokedexEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch(() => setError('Não foi possível carregar sua Pokédex'))
  }, [])

  return (
    <>
      <h1>Minha Pokédex</h1>
      <Link to="/adicionar">Adicionar pokémon</Link>
      {error ? (
        <p role="alert">{error}</p>
      ) : entries === null ? (
        <p>Carregando...</p>
      ) : entries.length === 0 ? (
        <p>Sua Pokédex está vazia</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry) => (
            <li key={entry.id}>
              <PokemonCard entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
