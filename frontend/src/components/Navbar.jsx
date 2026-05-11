import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import client from '../api/client'

export default function Navbar() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await client.post('/logout').catch(() => {})
    setUser(null)
    navigate('/login')
  }

  return (
    <nav className="bg-[#003087] text-white px-4 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <span className="text-[#CE1126]">⚾</span>
        10th Player
      </Link>
      {user && (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-blue-200 transition-colors">둘러보기</Link>
          <Link to="/swap" state={{ openForm: true }} className="hover:text-blue-200 transition-colors">교환 등록</Link>
          <span className="text-blue-200">{user.nickname}</span>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-xs transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </nav>
  )
}
