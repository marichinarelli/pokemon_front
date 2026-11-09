import { Link } from 'react-router-dom'
import type { PokedexEntry } from '../types'
import { typeBackground, typeColor } from '../lib/typeColors'

export function PokemonCard({ entry }: { entry: PokedexEntry }) {
  const title = entry.nickname ?? entry.pokemonName

  return (
    <Link to={`/pokemon/${entry.id}`} className="dex-card dex-panel">
      <div className="dex-art h-40" style={{ background: typeBackground(entry.types) }}>
        <span className="dex-number absolute left-2 top-2 rounded bg-white/85 px-1.5 text-xs">
          #{String(entry.pokeapiId).padStart(3, '0')}
        </span>
        <img
          src={entry.photoUrl ?? entry.artworkUrl}
          alt={title}
          className={entry.photoUrl ? 'h-28 w-28 rounded-full border-4 border-white object-cover' : 'h-32 w-32 object-contain'}
        />
      </div>
      <div className="border-t-3 border-dex-bezel p-3">
        <h2 className="truncate text-base font-bold capitalize">{title}</h2>
        {entry.nickname && <p className="truncate text-sm capitalize text-gray-500">{entry.pokemonName}</p>}
        <ul className="mt-2 flex flex-wrap gap-1">
          {entry.types.map((type) => (
            <li key={type} className="dex-type" style={{ background: typeColor(type) }}>{type}</li>
          ))}
        </ul>
      </div>
    </Link>
  )
}
