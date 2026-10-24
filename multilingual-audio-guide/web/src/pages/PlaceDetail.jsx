import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export default function PlaceDetail() {
  const { id } = useParams()
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const audioViRef = useRef(null)
  const [timeVi, setTimeVi] = useState(0)
  const [durVi, setDurVi] = useState(0)

  const sentencesVi = useMemo(() => {
    const text = place?.transcript || ''
    if (!text) return []
    const raw = text.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean)
    const totalChars = raw.reduce((sum, s) => sum + s.length, 0) || 1
    const totalTime = durVi > 0 ? durVi : 120
    let curr = 0
    return raw.map((sentence, idx) => {
      const slice = (sentence.length / totalChars) * totalTime
      const start = curr
      const end = start + slice
      curr = end
      return { id: idx, text: sentence, start, end }
    })
  }, [place?.transcript, durVi])

  const activeIdxVi = useMemo(() => {
    if (timeVi === 0 || sentencesVi.length === 0) return -1
    const found = sentencesVi.findIndex((s) => timeVi >= s.start && timeVi < s.end)
    return found !== -1 ? found : sentencesVi.length - 1
  }, [timeVi, sentencesVi])

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

          <section style={{ marginTop: 24, padding: 18, background: '#f8faf9', borderRadius: 14, border: '1px solid #e1eeeb' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>🎧 Nghe thuyết minh tiếng Việt</h2>

            {place.audio_url ? (
              <audio
                ref={audioViRef}
                key={place.audio_url}
                controls
                preload="metadata"
                src={place.audio_url}
                style={{ width: '100%', marginBottom: 12 }}
                onTimeUpdate={(e) => setTimeVi(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDurVi(e.currentTarget.duration)}
                onPlay={() => {
                  fetch('/api/analytics/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ landmarkId: id, lang: 'vi', title: place.title }),
                  }).catch(() => {});
                }}
              >
                Trình duyệt không hỗ trợ phát audio.
              </audio>
            ) : (
              <p style={{ color: '#888' }}>Chưa có audio tiếng Việt.</p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Nội dung thuyết minh (Chạm câu để nghe đoạn đó)</h3>
              <small style={{ color: '#65717d' }}>{sentencesVi.length} câu</small>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
              {sentencesVi.map((item, idx) => {
                const isActive = activeIdxVi === idx && timeVi > 0;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (audioViRef.current) {
                        audioViRef.current.currentTime = item.start;
                        audioViRef.current.play().catch(() => {});
                      }
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      borderLeft: isActive ? '4px solid #167d78' : '4px solid transparent',
                      background: isActive ? '#e8f4f2' : '#ffffff',
                      boxShadow: isActive ? '0 3px 10px rgba(22,125,120,0.1)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? '#167d78' : '#999', marginRight: 8 }}>
                      {Math.floor(item.start / 60).toString().padStart(2, '0')}:{(Math.floor(item.start) % 60).toString().padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 14, lineHeight: 1.7, color: isActive ? '#17212b' : '#444', fontWeight: isActive ? 600 : 400 }}>
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {place.audio_en_url && (
            <section style={{ marginTop: 24, padding: 18, background: '#f8faf9', borderRadius: 14, border: '1px solid #e1eeeb' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>🎧 English Audio Guide</h2>
              <audio
                controls
                preload="metadata"
                src={place.audio_en_url}
                style={{ width: '100%', marginBottom: 12 }}
                onPlay={() => {
                  fetch('/api/analytics/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ landmarkId: id, lang: 'en', title: place.title_en || place.title }),
                  }).catch(() => {});
                }}
              >
                Trình duyệt không hỗ trợ phát audio.
              </audio>
              {place.transcript_en && (
                <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: 14, color: '#444' }}>
                  {place.transcript_en}
                </div>
              )}
            </section>
          )}

          {place.images?.length > 0 && (
            <section>
              <h2>Hình ảnh</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {place.images.map((image) => (
                  <img
                    key={image.image_id}
                    src={image.image_url}
                    alt={place.title}
                    loading="lazy"
                    style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}