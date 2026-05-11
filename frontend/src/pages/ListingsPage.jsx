import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getListings } from '../api/listings'
import { STADIUMS } from '../constants/stadiums'

const today = () => new Date().toISOString().slice(0, 10)

export default function ListingsPage() {
  const [gameDate, setGameDate] = useState(today())
  const [stadium, setStadium] = useState('')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!stadium) return
    setLoading(true)
    setError(null)
    getListings(gameDate, stadium)
      .then(setListings)
      .catch(() => setError('불러오기 실패'))
      .finally(() => setLoading(false))
  }, [gameDate, stadium])

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#003087]">교환 매물 목록</h2>
        <Link
          to="/my-listings"
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          + 매물 등록
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">경기 날짜</label>
          <input
            type="date"
            value={gameDate}
            onChange={e => setGameDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">구장</label>
          <select
            value={stadium}
            onChange={e => setStadium(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
          >
            <option value="">구장 선택</option>
            {STADIUMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {!stadium && !loading && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">🏟️</p>
          <p>구장을 선택하면 매물이 표시됩니다.</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-red-500 text-center py-8">{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">🪑</p>
          <p>해당 날짜에 등록된 매물이 없습니다.</p>
        </div>
      )}

      <div className="space-y-3">
        {listings.map(listing => (
          <Link
            key={listing.id}
            to={`/listings/${listing.id}`}
            className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#003087]">
                {listing.ownerNickname}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                listing.status === 'OPEN'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {listing.status === 'OPEN' ? '교환 가능' : listing.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>📍 현재 좌석: {listing.section} {listing.row}열 {listing.seatNumber}번</p>
              {listing.desiredSection && (
                <p>🔄 원하는 구역: {listing.desiredSection}</p>
              )}
              {listing.note && (
                <p className="text-gray-400 text-xs mt-1">{listing.note}</p>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-400">
              그룹 {listing.groupSize}명 · {listing.gameDate}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
