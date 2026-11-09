import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthProvider'
import { getCurrentUser, onAuthChange } from '../services/auth'
import { testUser } from '../test/fixtures'

vi.mock('../services/auth')

function Probe() {
  const { user, loading } = useAuth()
  return <p>{loading ? 'carregando' : user?.email ?? 'anônimo'}</p>
}

describe('AuthProvider', () => {
  it('mostra o usuário da sessão atual depois de carregar', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(testUser)
    vi.mocked(onAuthChange).mockReturnValue(() => {})

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )

    expect(await screen.findByText('ash@pallet.com')).toBeInTheDocument()
  })
})
