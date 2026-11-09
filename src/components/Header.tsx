import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header>
      <Link to="/">Pokédex</Link>
      <span>{user?.email}</span>
      <button
        type="button"
        onClick={async () => {
          await signOut()
          navigate('/login')
        }}
      >
        Sair
      </button>
    </header>
  )
}
