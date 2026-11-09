export const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-stone-400', fire: 'bg-orange-500', water: 'bg-blue-500', electric: 'bg-yellow-400',
  grass: 'bg-green-500', ice: 'bg-cyan-300', fighting: 'bg-red-700', poison: 'bg-purple-500',
  ground: 'bg-amber-600', flying: 'bg-indigo-300', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-yellow-700', ghost: 'bg-violet-700', dragon: 'bg-indigo-700', dark: 'bg-neutral-700',
  steel: 'bg-slate-400', fairy: 'bg-pink-300',
}

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? 'bg-gray-400'
}
