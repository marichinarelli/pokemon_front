import { describe, it, expect } from 'vitest'
import { buildPhotoPath, photoPathFromUrl } from './storage'

describe('storage', () => {
  it('buildPhotoPath usa a pasta do usuário e a extensão do arquivo', () => {
    expect(buildPhotoPath('user-1', 'Foto.PNG', 'abc')).toBe('user-1/abc.png')
    expect(buildPhotoPath('user-1', 'foto', 'abc')).toBe('user-1/abc.jpg')
  })

  it('photoPathFromUrl extrai o caminho do bucket e devolve null para outras URLs', () => {
    expect(
      photoPathFromUrl('http://localhost:54321/storage/v1/object/public/pokemon-photos/user-1/abc.png'),
    ).toBe('user-1/abc.png')
    expect(photoPathFromUrl('https://example.com/x.png')).toBe(null)
  })
})
