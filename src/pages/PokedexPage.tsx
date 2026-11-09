import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PokemonCard } from '../components/PokemonCard'
import { listEntries } from '../services/pokedex'
import { filterEntries, uniqueTypes } from '../lib/filterEntries'
import type { PokedexEntry } from '../types'

export function PokedexPage() {
  const [entries, setEntries] = useState<PokedexEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [type, setType] = useState('')

  useEffect(() => {
    listEntries()
      .then(setEntries)
      .catch(() => setError('Não foi possível carregar sua Pokédex'))
  }, [])

  const filtered = entries ? filterEntries(entries, { text, type }) : []

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
        <>
          <label>
            Buscar <input type="search" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
          <label>
            Tipo{' '}
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos os tipos</option>
              {uniqueTypes(entries).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          {filtered.length === 0 ? (
            <p>Nenhum pokémon encontrado</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((entry) => (
                <li key={entry.id}>
                  <PokemonCard entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
