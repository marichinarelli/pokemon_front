import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    try {
      await signIn(email, password)
      navigate('/')
    } catch {
      setError('Email ou senha inválidos')
    }
  }

  return (
    <>
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email <input type="email" name="email" required />
        </label>
        <label>
          Senha <input type="password" name="password" required />
        </label>
        <button type="submit">Entrar</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <Link to="/cadastro">Criar conta</Link>
    </>
  )
}
