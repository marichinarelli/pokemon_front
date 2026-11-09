import { describe, it, expect } from 'vitest'
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
})
