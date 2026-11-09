import { describe, it, expect } from 'vitest'
import { validatePhoto } from './validatePhoto'

describe('validatePhoto', () => {
  it('recusa arquivo que não é imagem', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    expect(validatePhoto(file)).toBe('Envie um arquivo de imagem')
  })
})
