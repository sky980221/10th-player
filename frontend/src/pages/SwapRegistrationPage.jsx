import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyListings, createListing, cancelListing } from '../api/listings'
import { STADIUMS } from '../constants/stadiums'

const STATUS_LABEL = { OPEN: '교환 가능', MATCHED: '매칭됨', CANCELLED: '취소됨', COMPLETED: '완료' }
const STATUS_COLOR = {
  OPEN: 'bg-green-100 text-green-700',
  MATCHED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

const EMPTY_FORM = {
  gameDate: '', stadium: '', section: '', row: '', seatNumber: '',
  partySize: 1, isConsecutive: false, desiredSection: '', note: '',
}

export default function SwapRegistrationPage() {
  const { state } = useLocation()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(state?.openForm ?? false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setListings(await getMyListings()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createListing({
        ...form,
        partySize: Number(form.partySize),
        row: form.row || null,
        desiredSection: form.desiredSection || null,
        note: form.note || null,
      })
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || '등록 실패')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (listingId) => {
    if (!confirm('교환 등록을 취소하시겠습니까?')) return
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
          onClick={() => { setShowForm(v => !v); setError(null) }}
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          {showForm ? '취소' : '+ 교환 등록'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4 space-y-3">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-0.5">경기 날짜</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.gameDate}
                onChange={e => setForm(f => ({ ...f, gameDate: e.target.value }))}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 block mb-0.5">구장</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.stadium}
                onChange={e => setForm(f => ({ ...f, stadium: e.target.value }))}
                required
              >
                <option value="">구장 선택</option>
                {STADIUMS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-0.5">인원 수</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, partySize: n }))}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                    form.partySize === n
                      ? 'bg-[#003087] text-white border-[#003087]'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-[#003087]'
                  }`}
                >
                  {n}명
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-0.5">내 자리</label>
            <div className="grid grid-cols-3 gap-2">
              <input
                className="col-span-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                placeholder="구역 (예) 1루 레드)"
                required
              />
              <input
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.row}
                onChange={e => setForm(f => ({ ...f, row: e.target.value }))}
                placeholder="열 (예) 5)"
              />
              <input
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
                value={form.seatNumber}
                onChange={e => setForm(f => ({ ...f, seatNumber: e.target.value }))}
                placeholder="번 (예) 12)"
                required
              />
            </div>
          </div>

          {form.partySize >= 2 && (
            <div>
              <label className="text-xs text-gray-500 block mb-0.5">연석 여부</label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, isConsecutive: !f.isConsecutive }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  form.isConsecutive
                    ? 'bg-[#003087] text-white border-[#003087]'
                    : 'bg-white text-gray-500 border-gray-300 hover:border-[#003087]'
                }`}
              >
                <span>{form.isConsecutive ? '✓' : '○'}</span>
                연석 (붙어있는 자리)
              </button>
            </div>
          )}

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
            {submitting ? '등록 중...' : '교환 등록'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">🔄</p>
          <p>등록된 교환이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{listing.gameDate} · {listing.stadium}</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{listing.partySize}명 그룹</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[listing.status]}`}>
                  {STATUS_LABEL[listing.status]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#003087]/5 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-400 mb-1">내 자리</p>
                  <p className="text-sm font-bold text-[#003087]">{listing.section}</p>
                  <p className="text-xs text-gray-500">
                    {listing.row && `${listing.row}열 `}{listing.seatNumber}번
                  </p>
                  {listing.partySize >= 2 && (
                    <p className="text-[10px] mt-1 font-medium text-[#003087]">
                      {listing.isConsecutive ? '연석' : '비연석'}
                    </p>
                  )}
                </div>
                <span className="text-gray-300 text-lg">⇄</span>
                <div className="flex-1 bg-[#CE1126]/5 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-gray-400 mb-1">원하는 자리</p>
                  {listing.desiredSection
                    ? <p className="text-sm font-bold text-[#CE1126]">{listing.desiredSection}</p>
                    : <p className="text-sm text-gray-300">무관</p>
                  }
                </div>
              </div>

              {listing.note && (
                <p className="text-xs text-gray-400 mt-2">{listing.note}</p>
              )}

              {listing.status === 'OPEN' && (
                <button
                  onClick={() => handleCancel(listing.id)}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  등록 취소
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
