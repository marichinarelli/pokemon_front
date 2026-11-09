import { supabase } from '../lib/supabase'

export const PHOTO_BUCKET = 'pokemon-photos'

export function buildPhotoPath(userId: string, fileName: string, id: string): string {
  const ext = fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : 'jpg'
  return `${userId}/${id}.${ext}`
}
