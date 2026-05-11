import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function LoginPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-sm w-full">
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">⚾</span>
          <h1 className="text-2xl font-bold text-[#003087]">10th Player</h1>
          <p className="text-gray-500 text-sm text-center">
            두산 베어스 팬클럽 회원을 위한<br />좌석 교환 서비스
          </p>
        </div>

        <a
          href={`${import.meta.env.VITE_API_URL ?? ''}/oauth2/authorization/kakao`}
          className="w-full flex items-center justify-center gap-3 bg-[#FEE500] hover:bg-[#F6DC00] text-[#191919] font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.72 2 11.28c0 2.88 1.68 5.4 4.2 6.96l-.84 3.12 3.6-2.4c.96.24 1.98.36 3.04.36 5.52 0 10-3.72 10-8.28C22 6.72 17.52 3 12 3z"/>
          </svg>
          카카오로 로그인
        </a>
      </div>
    </div>
  )
}
