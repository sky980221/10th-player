import { useState, useEffect } from 'react'
import { getMyTickets, registerTicket } from '../api/tickets'
import { getMyListings, createListing, cancelListing } from '../api/listings'
import { STADIUMS } from '../constants/stadiums'

const STATUS_LABEL = { OPEN: '교환 가능', MATCHED: '매칭됨', CANCELLED: '취소됨', COMPLETED: '완료' }
const STATUS_COLOR = {
  OPEN: 'bg-green-100 text-green-700',
  MATCHED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

export default function SwapRegistrationPage() {
  const [tickets, setTickets] = useState([])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({ section: '', row: '', seatNumber: '', gameDate: '', stadium: '' })
  const [ticketSubmitting, setTicketSubmitting] = useState(false)
  const [ticketError, setTicketError] = useState(null)

  const [expandedTicketId, setExpandedTicketId] = useState(null)
  const [listingForm, setListingForm] = useState({ desiredSection: '', note: '' })
  const [listingSubmitting, setListingSubmitting] = useState(false)
  const [listingError, setListingError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [t, l] = await Promise.all([getMyTickets(), getMyListings()])
      setTickets(t)
      setListings(l)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const listingByTicketId = Object.fromEntries(listings.map(l => [l.ticketId, l]))

  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    setTicketSubmitting(true)
    setTicketError(null)
    try {
      await registerTicket(ticketForm)
      setTicketForm({ section: '', row: '', seatNumber: '', gameDate: '', stadium: '' })
      setShowTicketForm(false)
      load()
    } catch (err) {
      setTicketError(err.response?.data?.message || '등록 실패')
    } finally {
      setTicketSubmitting(false)
    }
  }

  const handleListingSubmit = async (e, ticketId) => {
    e.preventDefault()
    setListingSubmitting(true)
    setListingError(null)
    try {
      await createListing({
        ticketId,
        desiredSection: listingForm.desiredSection || null,
        note: listingForm.note || null,
      })
      setExpandedTicketId(null)
      setListingForm({ desiredSection: '', note: '' })
      load()
    } catch (err) {
      setListingError(err.response?.data?.message || '등록 실패')
    } finally {
      setListingSubmitting(false)
    }
  }

  const handleCancel = async (listingId) => {
    if (!confirm('매물을 취소하시겠습니까?')) return
    try {
      await cancelListing(listingId)
      load()
    } catch (err) {
      alert(err.response?.data?.message || '취소 실패')
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003087]">교환 등록</h2>
        <button
          onClick={() => setShowTicketForm(v => !v)}
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          {showTicketForm ? '취소' : '+ 티켓 등록'}
        </button>
      </div>

      {showTicketForm && (
        <form onSubmit={handleTicketSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-gray-700">티켓 등록</h3>
          {ticketError && <p className="text-red-500 text-sm">{ticketError}</p>}
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">경기 날짜</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              value={ticketForm.gameDate}
              onChange={e => setTicketForm(f => ({ ...f, gameDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-0.5">구장</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              value={ticketForm.stadium}
              onChange={e => setTicketForm(f => ({ ...f, stadium: e.target.value }))}
              required
            >
              <option value="">구장 선택</option>
              {STADIUMS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">구역</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={ticketForm.section}
                onChange={e => setTicketForm(f => ({ ...f, section: e.target.value }))}
                placeholder="예) 1루 레드"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">열</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={ticketForm.row}
                onChange={e => setTicketForm(f => ({ ...f, row: e.target.value }))}
                placeholder="예) 5"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">좌석번호</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={ticketForm.seatNumber}
                onChange={e => setTicketForm(f => ({ ...f, seatNumber: e.target.value }))}
                placeholder="예) 12"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={ticketSubmitting}
            className="w-full bg-[#003087] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
          >
            {ticketSubmitting ? '등록 중...' : '티켓 등록'}
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
          <p>등록된 티켓이 없습니다.<br />티켓을 먼저 등록해주세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => {
            const listing = listingByTicketId[ticket.id]
            const isExpanded = expandedTicketId === ticket.id

            return (
              <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#003087]">{ticket.stadium}</p>
                    <p className="text-sm text-gray-600">
                      {ticket.section} {ticket.row && `${ticket.row}열`} {ticket.seatNumber}번
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{ticket.gameDate}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {ticket.swapped ? (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">교환완료</span>
                    ) : listing ? (
                      <>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[listing.status]}`}>
                          {STATUS_LABEL[listing.status]}
                        </span>
                        {listing.status === 'OPEN' && (
                          <button
                            onClick={() => handleCancel(listing.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            취소
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setExpandedTicketId(isExpanded ? null : ticket.id)
                          setListingForm({ desiredSection: '', note: '' })
                          setListingError(null)
                        }}
                        className="text-xs bg-[#003087] text-white px-3 py-1 rounded-full hover:bg-blue-900 transition-colors"
                      >
                        교환 등록
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && !listing && (
                  <form onSubmit={e => handleListingSubmit(e, ticket.id)} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {listingError && <p className="text-red-500 text-sm">{listingError}</p>}
                    <div>
                      <label className="text-xs text-gray-500 block mb-0.5">원하는 구역 (선택)</label>
                      <input
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                        value={listingForm.desiredSection}
                        onChange={e => setListingForm(f => ({ ...f, desiredSection: e.target.value }))}
                        placeholder="예) 3루 블루"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-0.5">메모 (선택)</label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] resize-none"
                        rows={2}
                        value={listingForm.note}
                        onChange={e => setListingForm(f => ({ ...f, note: e.target.value }))}
                        placeholder="추가 설명을 입력하세요."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={listingSubmitting}
                        className="flex-1 bg-[#003087] text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-900 disabled:opacity-50 transition-colors"
                      >
                        {listingSubmitting ? '등록 중...' : '교환 등록'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedTicketId(null)}
                        className="px-4 py-1.5 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
                      >
                        취소
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
