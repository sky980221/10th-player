import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getListings } from '../api/listings'
import { getRequests, sendRequest, acceptRequest, rejectRequest, cancelRequest } from '../api/requests'
import { getMyTickets } from '../api/tickets'
import { useAuth } from '../contexts/AuthContext'

export default function ListingDetailPage() {
  const { listingId } = useParams()
  const { user } = useAuth()

  const [listing, setListing] = useState(null)
  const [requests, setRequests] = useState([])
  const [myTickets, setMyTickets] = useState([])
  const [selectedTicketId, setSelectedTicketId] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // listing은 날짜가 없으면 오늘 기준으로 검색. 실제론 ID로 직접 조회 API가 있어야 하나,
  // 현재 백엔드가 목록 조회만 지원하므로 state를 navigate로 전달하거나 requests 조회로 대체.
  // 여기서는 requests를 로드해 listing 정보를 파악합니다.
  useEffect(() => {
    getRequests(listingId)
      .then(setRequests)
      .catch(() => {})
    getMyTickets()
      .then(setMyTickets)
      .catch(() => {})
  }, [listingId])

  const isOwner = listing ? listing.ownerId === user?.id : false

  const handleSendRequest = async (e) => {
    e.preventDefault()
    if (!selectedTicketId) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await sendRequest(listingId, {
        requesterTicketId: Number(selectedTicketId),
        message,
      })
      setRequests(prev => [...prev, result])
      setMessage('')
      setSelectedTicketId('')
    } catch (err) {
      setError(err.response?.data?.message || '신청 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAccept = async (requestId) => {
    try {
      const updated = await acceptRequest(requestId)
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r))
    } catch (err) {
      alert(err.response?.data?.message || '수락 실패')
    }
  }

  const handleReject = async (requestId) => {
    try {
      const updated = await rejectRequest(requestId)
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r))
    } catch (err) {
      alert(err.response?.data?.message || '거절 실패')
    }
  }

  const handleCancel = async (requestId) => {
    try {
      const updated = await cancelRequest(requestId)
      setRequests(prev => prev.map(r => r.id === requestId ? updated : r))
    } catch (err) {
      alert(err.response?.data?.message || '취소 실패')
    }
  }

  const myRequest = requests.find(r => r.requesterId === user?.id)
  const availableTickets = myTickets.filter(t => !t.swapped)

  const statusLabel = {
    PENDING: '대기 중',
    ACCEPTED: '수락됨',
    REJECTED: '거절됨',
    CANCELLED: '취소됨',
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Link to="/" className="text-sm text-[#003087] hover:underline">← 목록으로</Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-bold text-[#003087] mb-1">교환 신청 현황</h2>
        <Link
          to={`/chat/${listingId}`}
          className="inline-block mt-1 text-sm bg-[#003087] text-white px-3 py-1 rounded-lg hover:bg-blue-900 transition-colors"
        >
          💬 채팅방 입장
        </Link>
      </div>

      {/* 교환 신청 (비소유자) */}
      {!isOwner && !myRequest && (
        <form onSubmit={handleSendRequest} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">교환 신청하기</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {availableTickets.length === 0 ? (
            <p className="text-gray-400 text-sm">
              교환 가능한 티켓이 없습니다.{' '}
              <Link to="/tickets" className="text-[#003087] underline">티켓 등록</Link>
            </p>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">내 티켓 선택</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  value={selectedTicketId}
                  onChange={e => setSelectedTicketId(e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {availableTickets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.section} {t.row}열 {t.seatNumber}번 ({t.gameDate})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">메시지 (선택)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
                  rows={2}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="간단한 메시지를 남겨주세요."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#CE1126] text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '신청 중...' : '교환 신청'}
              </button>
            </>
          )}
        </form>
      )}

      {/* 내 신청 상태 */}
      {myRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-700 mb-2">내 신청</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>티켓: {myRequest.requesterTicketSection} {myRequest.requesterTicketSeatNumber}번</p>
            {myRequest.message && <p>메시지: {myRequest.message}</p>}
            <p>상태: <span className="font-medium">{statusLabel[myRequest.status] || myRequest.status}</span></p>
          </div>
          {myRequest.status === 'PENDING' && (
            <button
              onClick={() => handleCancel(myRequest.id)}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              신청 취소
            </button>
          )}
        </div>
      )}

      {/* 신청 목록 (소유자) */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-700">신청 목록 ({requests.length}건)</h3>
        {requests.length === 0 && (
          <p className="text-gray-400 text-sm">아직 신청이 없습니다.</p>
        )}
        {requests.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{req.requesterNickname}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                req.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {statusLabel[req.status] || req.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {req.requesterTicketSection} {req.requesterTicketSeatNumber}번
            </p>
            {req.message && <p className="text-xs text-gray-400 mt-0.5">{req.message}</p>}

            {isOwner && req.status === 'PENDING' && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                >
                  수락
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  거절
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
