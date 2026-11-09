export const MAX_PHOTO_BYTES = 10 * 1024 * 1024

export function validatePhoto(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'Envie um arquivo de imagem'
  if (file.size > MAX_PHOTO_BYTES) return 'A imagem deve ter no máximo 10MB'
  return null
}
