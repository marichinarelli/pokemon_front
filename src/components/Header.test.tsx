import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'
import { renderPage } from '../test/renderPage'

describe('Header', () => {
  it('ao clicar em Sair desloga e vai para o login', async () => {
    const user = userEvent.setup()
    const { auth } = renderPage(<Header />, { path: '/', route: '/' })

    expect(screen.getByText('ash@pallet.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    expect(auth.signOut).toHaveBeenCalledTimes(1)
    expect(await screen.findByTestId('location')).toHaveTextContent('/login')
  })
})
