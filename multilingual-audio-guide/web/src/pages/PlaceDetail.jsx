import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_BASE = (
  import.meta.env.VITE_GUIDE_API_URL || 'http://localhost:3002'
).replace(/\/$/, '')

export default function PlaceDetail() {
  const { id } = useParams()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadPlace() {
      setLoading(true)
      setError('')
      setPlace(null)

      try {
        if (!id) {
          throw new Error('Đường dẫn chưa có ID địa danh.')
        }

        const response = await fetch(
          `${API_BASE}/api/landmarks/${encodeURIComponent(id)}?lang=vi`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? 'Không tìm thấy địa danh.'
              : 'Không tải được nội dung địa danh.'
          )
        }

        const result = await response.json()

        if (!result.data) {
          throw new Error('API chưa trả về dữ liệu địa danh.')
        }

        if (!controller.signal.aborted) {
          setPlace(result.data)
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

    loadPlace()

    return () => controller.abort()
  }, [id])

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 24,
      }}
    >
      <Link to="/places">← Danh sách địa danh</Link>

      {loading && <p>Đang tải nội dung...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && place && (
        <>
          <h1>{place.title}</h1>

          {place.subtitle && <p>{place.subtitle}</p>}

          {place.background_image_url && (
            <img
              src={place.background_image_url}
              alt={place.title}
              style={{
                width: '100%',
                maxHeight: 420,
                objectFit: 'cover',
                borderRadius: 12,
              }}
            />
          )}

          {place.description &&
            place.description !== 'Nội dung mẫu.' && (
              <p>{place.description}</p>
            )}

          <section>
            <h2>Nghe thuyết minh tiếng Việt</h2>

            {place.audio_url ? (
              <audio
                key={place.audio_url}
                controls
                preload="metadata"
                src={place.audio_url}
                style={{ width: '100%' }}
              >
                Trình duyệt không hỗ trợ phát audio.
              </audio>
            ) : (
              <p>Chưa có audio tiếng Việt.</p>
            )}
          </section>

          <section>
            <h2>Nội dung thuyết minh</h2>

            <div
              style={{
                whiteSpace: 'pre-line',
                lineHeight: 1.8,
                overflowWrap: 'anywhere',
              }}
            >
              {place.transcript || 'Chưa có bài thuyết minh.'}
            </div>
          </section>
        </>
      )}
    </main>
  )
}