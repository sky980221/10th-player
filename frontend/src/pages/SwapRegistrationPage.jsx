import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createListing } from '../api/listings'
import { STADIUMS } from '../constants/stadiums'

const EMPTY_FORM = {
  gameDate: '', stadium: '', section: '', row: '', seatNumber: '',
  partySize: 1, isConsecutive: false, desiredSection: '', note: '',
}

export default function SwapRegistrationPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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
      navigate('/my-swaps')
    } catch (err) {
      setError(err.response?.data?.message || '등록 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold text-[#003087] mb-4">교환 등록</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
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
    </div>
  )
}
