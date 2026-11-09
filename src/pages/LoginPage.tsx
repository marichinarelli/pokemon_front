import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { DexCompact } from '../components/DexDevice'

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
    <DexCompact>
      <h1 className="dex-title">Entrar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="dex-field">
          Email <input className="dex-input" type="email" name="email" required />
        </label>
        <label className="dex-field">
          Senha <input className="dex-input" type="password" name="password" required />
        </label>
        <button type="submit" className="dex-btn mt-1">Entrar</button>
      </form>
      {error && <p role="alert" className="dex-alert">{error}</p>}
      <Link to="/cadastro" className="text-center text-sm font-semibold text-dex-blue underline-offset-4 hover:underline">Criar conta</Link>
    </DexCompact>
  )
}
