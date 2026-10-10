import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PlaceCard from '../components/place/PlaceCard'

const API_BASE = (
  import.meta.env.VITE_GUIDE_API_URL || 'http://localhost:3002'
).replace(/\/$/, '')

export default function PlaceList() {
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlaces() {
      try {
        const response = await fetch(
          `${API_BASE}/api/landmarks?lang=vi`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Không tải được danh sách địa danh.')
        }

        const result = await response.json()

        if (!Array.isArray(result.data)) {
          throw new Error('API trả về danh sách không hợp lệ.')
        }

        if (!controller.signal.aborted) {
          setPlaces(result.data)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message || 'Không kết nối được API.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadPlaces()

    return () => controller.abort()
  }, [])

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <header>
        <h1>Khám phá địa danh Sài Gòn</h1>
        <p>Chọn địa danh để đọc và nghe thuyết minh tiếng Việt.</p>
        <Link to="/login">Đăng nhập quản lý</Link>
      </header>

      {loading && <p>Đang tải danh sách...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && places.length === 0 && (
        <p>Chưa có địa danh.</p>
      )}

      {!loading && !error && places.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 20,
            marginTop: 24,
          }}
        >
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </main>
  )
}