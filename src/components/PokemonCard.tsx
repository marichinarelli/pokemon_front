import { Link } from 'react-router-dom'
import type { PokedexEntry } from '../types'
import { typeColor } from '../lib/typeColors'

export function PokemonCard({ entry }: { entry: PokedexEntry }) {
  const title = entry.nickname ?? entry.pokemonName

  return (
    <Link to={`/pokemon/${entry.id}`} className="block rounded-xl border p-3 shadow-sm hover:shadow-md">
      <img src={entry.photoUrl ?? entry.artworkUrl} alt={title} className="mx-auto h-32 w-32 object-contain" />
      <h2 className="mt-2 text-lg font-semibold capitalize">{title}</h2>
      {entry.nickname && <p className="text-sm capitalize text-gray-500">{entry.pokemonName}</p>}
      <ul className="mt-2 flex gap-1">
        {entry.types.map((type) => (
          <li key={type} className={`rounded px-2 text-xs capitalize text-white ${typeColor(type)}`}>{type}</li>
        ))}
      </ul>
    </Link>
  )
}
