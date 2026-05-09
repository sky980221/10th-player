import { useState, useEffect } from 'react'
import { getMyTickets, registerTicket } from '../api/tickets'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    section: '',
    row: '',
    seatNumber: '',
    gameDate: '',
    gameTitle: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    getMyTickets()
      .then(setTickets)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await registerTicket(form)
      setForm({ section: '', row: '', seatNumber: '', gameDate: '', gameTitle: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || '등록 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003087]">내 티켓</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          {showForm ? '취소' : '+ 티켓 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700">티켓 등록</h3>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">구역</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                placeholder="예) 1루 레드"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">열</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.row}
                onChange={e => setForm(f => ({ ...f, row: e.target.value }))}
                placeholder="예) 5"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">좌석번호</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.seatNumber}
                onChange={e => setForm(f => ({ ...f, seatNumber: e.target.value }))}
                placeholder="예) 12"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">경기 날짜</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              value={form.gameDate}
              onChange={e => setForm(f => ({ ...f, gameDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">경기 명</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              value={form.gameTitle}
              onChange={e => setForm(f => ({ ...f, gameTitle: e.target.value }))}
              placeholder="예) 두산 vs LG"
              required
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#003087] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">🎫</p>
          <p>등록된 티켓이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#003087]">{ticket.gameTitle}</p>
                  <p className="text-sm text-gray-600">
                    {ticket.section} {ticket.row}열 {ticket.seatNumber}번
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{ticket.gameDate}</p>
                </div>
                {ticket.swapped && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">교환완료</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
