import { describe, it, expect } from 'vitest'
import { buildPhotoPath } from './storage'

describe('storage', () => {
  it('buildPhotoPath usa a pasta do usuário e a extensão do arquivo', () => {
    expect(buildPhotoPath('user-1', 'Foto.PNG', 'abc')).toBe('user-1/abc.png')
    expect(buildPhotoPath('user-1', 'foto', 'abc')).toBe('user-1/abc.jpg')
  })
})
