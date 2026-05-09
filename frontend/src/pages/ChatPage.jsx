import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMessages, sendMessage } from '../api/chat'
import { useAuth } from '../contexts/AuthContext'

const POLL_INTERVAL = 5000

export default function ChatPage() {
  const { listingId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const latestIdRef = useRef(0)

  const loadMessages = async (isInitial = false) => {
    try {
      const data = await getMessages(listingId)
      setMessages(data)
      if (isInitial && data.length > 0) {
        latestIdRef.current = data[data.length - 1].id
      } else if (data.length > 0) {
        const newest = data[data.length - 1].id
        if (newest > latestIdRef.current) {
          latestIdRef.current = newest
        }
      }
    } catch {}
  }

  useEffect(() => {
    loadMessages(true)
    const interval = setInterval(() => loadMessages(), POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [listingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setSending(true)
    try {
      const msg = await sendMessage(listingId, content.trim())
      setMessages(prev => [...prev, msg])
      setContent('')
    } catch (err) {
      alert(err.response?.data?.message || '전송 실패')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dt) => {
    if (!dt) return ''
    const d = new Date(dt)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-56px)]">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <Link to={`/listings/${listingId}`} className="text-[#003087] text-sm hover:underline">←</Link>
        <h2 className="font-semibold text-[#003087]">교환 채팅 #{listingId}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">첫 메시지를 보내보세요!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user?.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                {!isMine && (
                  <span className="text-xs text-gray-400 px-1">{msg.senderNickname}</span>
                )}
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  isMine
                    ? 'bg-[#003087] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-white border-t border-gray-200">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-[#003087] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
        >
          전송
        </button>
      </form>
    </div>
  )
}
