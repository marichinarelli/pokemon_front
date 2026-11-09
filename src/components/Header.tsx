import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { DexLights } from './DexDevice'

export function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="dex-top flex-wrap">
      <DexLights />
      <Link to="/" className="dex-title text-white no-underline drop-shadow-[2px_2px_0_rgba(0,0,0,0.35)]">
        Pokédex
      </Link>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden truncate text-sm font-medium text-white/85 sm:inline">{user?.email}</span>
        <button
          type="button"
          className="dex-btn dex-btn-ghost px-3 py-1.5 text-sm"
          onClick={async () => {
            await signOut()
            navigate('/login')
          }}
        >
          Sair
        </button>
      </div>
    </header>
  )
}
