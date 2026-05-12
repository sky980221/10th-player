import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getChatRooms } from '../api/chat'

export default function MyChatPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getChatRooms()
      .then(setRooms)
      .finally(() => setLoading(false))
  }, [])

  const formatTime = (dt) => {
    if (!dt) return ''
    const d = new Date(dt)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    return isToday
      ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold text-[#003087] mb-4">내 채팅</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">💬</p>
          <p>진행 중인 채팅이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map(room => (
            <Link
              key={room.listingId}
              to={`/chat/${room.listingId}`}
              className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-[#003087]/10 flex items-center justify-center text-[#003087] font-bold text-sm flex-shrink-0">
                {room.ownerNickname.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-semibold text-gray-800">{room.ownerNickname}</p>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{formatTime(room.lastMessageAt)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{room.gameDate} · {room.stadium}</p>
                <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
