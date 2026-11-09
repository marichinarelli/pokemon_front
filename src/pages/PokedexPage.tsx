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
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="dex-title">Minha Pokédex</h1>
          {entries && entries.length > 0 && (
            <p className="dex-number mt-1 text-sm">
              {String(entries.length).padStart(3, '0')} registrados
            </p>
          )}
        </div>
        <Link to="/adicionar" className="dex-btn dex-btn-green">
          Adicionar pokémon
        </Link>
      </div>
      {error ? (
        <p role="alert" className="dex-alert">{error}</p>
      ) : entries === null ? (
        <p className="dex-number py-12 text-center">Carregando...</p>
      ) : entries.length === 0 ? (
        <div className="dex-panel mx-auto max-w-sm p-8 text-center">
          <p className="font-semibold">Sua Pokédex está vazia</p>
        </div>
      ) : (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_14rem]">
            <label className="dex-field">
              Buscar <input type="search" className="dex-input" value={text} onChange={(e) => setText(e.target.value)} />
            </label>
            <label className="dex-field">
              Tipo{' '}
              <select className="dex-input capitalize" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Todos os tipos</option>
                {uniqueTypes(entries).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {filtered.length === 0 ? (
            <p className="dex-number py-10 text-center">Nenhum pokémon encontrado</p>
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
