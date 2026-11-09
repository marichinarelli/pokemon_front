import { describe, it, expect } from 'vitest'
import { validatePhoto, MAX_PHOTO_BYTES } from './validatePhoto'

function imageOfSize(bytes: number) {
  const file = new File(['x'], 'a.png', { type: 'image/png' })
  Object.defineProperty(file, 'size', { value: bytes })
  return file
}

describe('validatePhoto', () => {
  it('recusa arquivo que não é imagem', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    expect(validatePhoto(file)).toBe('Envie um arquivo de imagem')
  })

  it('recusa imagem acima de 10MB e aceita imagem de exatamente 10MB', () => {
    expect(validatePhoto(imageOfSize(MAX_PHOTO_BYTES + 1))).toBe('A imagem deve ter no máximo 10MB')
    expect(validatePhoto(imageOfSize(MAX_PHOTO_BYTES))).toBeNull()
  })
})
