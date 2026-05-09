import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getListings, createListing, cancelListing } from '../api/listings'
import { getMyTickets } from '../api/tickets'
import { useAuth } from '../contexts/AuthContext'

const today = () => new Date().toISOString().slice(0, 10)

export default function MyListingsPage() {
  const { user } = useAuth()
  const [myTickets, setMyTickets] = useState([])
  const [listings, setListings] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ticketId: '', desiredSection: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const loadListings = async () => {
    // 오늘 + 다음 30일 범위 조회 후 내 것만 필터
    try {
      const data = await getListings(today())
      setListings(data.filter(l => l.ownerId === user?.id))
    } catch {}
  }

  useEffect(() => {
    getMyTickets().then(setMyTickets).catch(() => {})
    loadListings()
  }, [user])

  const availableTickets = myTickets.filter(t => !t.swapped)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const result = await createListing({
        ticketId: Number(form.ticketId),
        desiredSection: form.desiredSection || null,
        note: form.note || null,
      })
      setListings(prev => [result, ...prev])
      setForm({ ticketId: '', desiredSection: '', note: '' })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.message || '등록 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (listingId) => {
    if (!confirm('매물을 취소하시겠습니까?')) return
    try {
      await cancelListing(listingId)
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: 'CANCELLED' } : l))
    } catch (err) {
      alert(err.response?.data?.message || '취소 실패')
    }
  }

  const statusLabel = { OPEN: '교환 가능', MATCHED: '매칭됨', CANCELLED: '취소됨', COMPLETED: '완료' }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003087]">내 매물</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          {showForm ? '취소' : '+ 매물 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700">매물 등록</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {availableTickets.length === 0 ? (
            <p className="text-gray-400 text-sm">
              등록 가능한 티켓이 없습니다.{' '}
              <Link to="/tickets" className="text-[#003087] underline">티켓 등록하기</Link>
            </p>
          ) : (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">티켓 선택</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  value={form.ticketId}
                  onChange={e => setForm(f => ({ ...f, ticketId: e.target.value }))}
                  required
                >
                  <option value="">선택하세요</option>
                  {availableTickets.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.section} {t.row}열 {t.seatNumber}번 ({t.gameDate} {t.gameTitle})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">원하는 구역 (선택)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                  value={form.desiredSection}
                  onChange={e => setForm(f => ({ ...f, desiredSection: e.target.value }))}
                  placeholder="예) 3루 블루"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-0.5">메모 (선택)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
                  rows={2}
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="추가 설명을 입력하세요."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#003087] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
              >
                {submitting ? '등록 중...' : '등록'}
              </button>
            </>
          )}
        </form>
      )}

      {listings.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">📋</p>
          <p>등록된 매물이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-[#003087]">{listing.gameTitle}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  listing.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                  listing.status === 'MATCHED' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {statusLabel[listing.status] || listing.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {listing.section} {listing.row}열 {listing.seatNumber}번 · {listing.gameDate}
              </p>
              {listing.desiredSection && (
                <p className="text-xs text-gray-400 mt-0.5">원하는 구역: {listing.desiredSection}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Link
                  to={`/listings/${listing.id}`}
                  className="text-xs text-[#003087] hover:underline"
                >
                  신청 보기
                </Link>
                <Link
                  to={`/chat/${listing.id}`}
                  className="text-xs text-[#003087] hover:underline"
                >
                  채팅
                </Link>
                {listing.status === 'OPEN' && (
                  <button
                    onClick={() => handleCancel(listing.id)}
                    className="text-xs text-red-500 hover:underline ml-auto"
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
