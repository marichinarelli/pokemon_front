import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../auth/AuthProvider'
import type { AppUser } from '../types'
import { testUser } from './fixtures'

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname}</p>
}

type RenderPageOptions = {
  path: string
  route: string
  user?: AppUser | null
  auth?: Partial<AuthContextValue>
}

export function renderPage(element: ReactElement, options: RenderPageOptions) {
  const auth: AuthContextValue = {
    user: options.user === undefined ? testUser : options.user,
    loading: false,
    signIn: vi.fn().mockResolvedValue(undefined),
    signUp: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...options.auth,
  }
  const result = render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[options.route]}>
        <Routes>
          <Route path={options.path} element={element} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
  return { ...result, auth }
}
