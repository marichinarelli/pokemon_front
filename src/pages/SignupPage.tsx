import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await signUp(email, password)
    navigate('/')
  }

  return (
    <>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Senha <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button type="submit">Criar conta</button>
      </form>
      <Link to="/login">Já tenho conta</Link>
    </>
  )
}
