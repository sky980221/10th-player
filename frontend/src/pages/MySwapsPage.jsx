import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyListings, cancelListing } from '../api/listings'

const STATUS_LABEL = { OPEN: '교환 가능', MATCHED: '매칭됨', CANCELLED: '취소됨', COMPLETED: '완료' }
const STATUS_COLOR = {
  OPEN: 'bg-green-100 text-green-700',
  MATCHED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-gray-100 text-gray-500',
}

export default function MySwapsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setListings(await getMyListings()) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
        <h2 className="text-xl font-bold text-[#003087]">내 교환</h2>
        <Link
          to="/swap"
          state={{ openForm: true }}
          className="bg-[#003087] text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
        >
          + 교환 등록
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#003087] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-2">🔄</p>
          <p className="mb-4">등록된 교환이 없습니다.</p>
          <Link
            to="/swap"
            state={{ openForm: true }}
            className="inline-block bg-[#003087] text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-900 transition-colors"
          >
            교환 등록하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
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
