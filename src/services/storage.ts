import { supabase } from '../lib/supabase'

export const PHOTO_BUCKET = 'pokemon-photos'

export function buildPhotoPath(userId: string, fileName: string, id: string): string {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'jpg'
  return `${userId}/${id}.${ext}`
}

const PUBLIC_MARKER = `/storage/v1/object/public/${PHOTO_BUCKET}/`

export function photoPathFromUrl(url: string): string | null {
  const index = url.indexOf(PUBLIC_MARKER)
  return index === -1 ? null : url.slice(index + PUBLIC_MARKER.length)
}
