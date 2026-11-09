import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { DexCompact } from '../components/DexDevice'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      return
    }
    try {
      await signUp(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta')
    }
  }

  return (
    <DexCompact>
      <h1 className="dex-title">Criar conta</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="dex-field">
          Email <input className="dex-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="dex-field">
          Senha <input className="dex-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit" className="dex-btn mt-1">Criar conta</button>
      </form>
      {error && <p role="alert" className="dex-alert">{error}</p>}
      <Link to="/login" className="text-center text-sm font-semibold text-dex-blue underline-offset-4 hover:underline">Já tenho conta</Link>
    </DexCompact>
  )
}
