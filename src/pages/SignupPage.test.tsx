import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderPage } from '../test/renderPage'
import { SignupPage } from './SignupPage'

describe('SignupPage', () => {
  it('com dados válidos cria a conta e vai para a Pokédex', async () => {
    const user = userEvent.setup()
    const { auth } = renderPage(<SignupPage />, { path: '/cadastro', route: '/cadastro', user: null })

    await user.type(screen.getByLabelText('Email'), 'misty@cerulean.com')
    await user.type(screen.getByLabelText('Senha'), 'staryu123')
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(auth.signUp).toHaveBeenCalledWith('misty@cerulean.com', 'staryu123')
    expect(await screen.findByTestId('location')).toHaveTextContent('/')
  })
})
