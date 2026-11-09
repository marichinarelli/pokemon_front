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

export async function uploadPhoto(userId: string, file: File): Promise<string> {
  const path = buildPhotoPath(userId, file.name, crypto.randomUUID())
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type })
  if (error) throw new Error(error.message)
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function deletePhoto(photoUrl: string): Promise<void> {
  const path = photoPathFromUrl(photoUrl)
  if (!path) return
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([path])
  if (error) throw new Error(error.message)
}
