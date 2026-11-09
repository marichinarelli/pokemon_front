export const TYPE_COLORS: Record<string, string> = {
  normal: '#a8a77a', fire: '#ee8130', water: '#6390f0', electric: '#e5b800',
  grass: '#4caf50', ice: '#5fc9c4', fighting: '#c22e28', poison: '#a33ea1',
  ground: '#d4a843', flying: '#8f7ce8', psychic: '#f95587', bug: '#8fa31a',
  rock: '#b6a136', ghost: '#735797', dragon: '#6f35fc', dark: '#705746',
  steel: '#8a8aa6', fairy: '#d685ad',
}

export function typeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#9aa3ab'
}

/** Fundo suave na cor do tipo principal, para a área da arte. */
export function typeBackground(types: string[]): string {
  const main = typeColor(types[0] ?? '')
  const second = typeColor(types[1] ?? types[0] ?? '')
  return `linear-gradient(135deg, ${main} 0%, ${second} 100%)`
}
