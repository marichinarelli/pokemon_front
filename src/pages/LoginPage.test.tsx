import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('com credenciais válidas entra e vai para a Pokédex', async () => {
    const user = userEvent.setup()
    const { auth } = renderPage(<LoginPage />, { path: '/login', route: '/login', user: null })

    await user.type(screen.getByLabelText('Email'), 'ash@pallet.com')
    await user.type(screen.getByLabelText('Senha'), 'pikachu123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(auth.signIn).toHaveBeenCalledWith('ash@pallet.com', 'pikachu123')
    expect(await screen.findByTestId('location')).toHaveTextContent('/')
  })

  it('com credenciais inválidas mostra erro e continua no login', async () => {
    const user = userEvent.setup()
    renderPage(<LoginPage />, {
      path: '/login',
      route: '/login',
      user: null,
      auth: { signIn: vi.fn().mockRejectedValue(new Error('Email ou senha inválidos')) },
    })

    await user.type(screen.getByLabelText('Email'), 'ash@pallet.com')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha inválidos')
    expect(screen.queryByTestId('location')).toBeNull()
  })
})
