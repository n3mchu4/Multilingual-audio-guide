import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import SynchronizedTranscript from '../components/place/SynchronizedTranscript';
import { API_BASE, recordPlayback } from '../services/analytics';

function Narration({ place, lang }) {
  const src = place[`audio_${lang}_url`] || '';
  const audio = useAudioPlayer(src, () => { void recordPlayback(place.id, lang); });
  return (
    <section style={{ marginTop: 24, padding: 18, background: '#f8faf9', borderRadius: 14 }}>
      <h2>{lang === 'vi' ? 'Thuyết minh tiếng Việt' : 'English Audio Guide'}</h2>
      <button type="button" disabled={!src} onClick={audio.toggle}>
        {audio.playing ? (lang === 'vi' ? 'Tạm dừng' : 'Pause') : (lang === 'vi' ? 'Phát audio' : 'Play audio')}
      </button>
      <input type="range" min="0" max={audio.duration || 0} step="0.1" value={audio.elapsed}
        disabled={!src || !audio.duration} aria-label={lang === 'vi' ? 'Tua audio' : 'Seek audio'}
        onChange={event => audio.seek(Number(event.target.value), false)} />
      {!src && <p>{lang === 'vi' ? 'Chưa có audio tiếng Việt.' : 'English audio is not available.'}</p>}
      {audio.error && <p role="alert">{audio.error}</p>}
      <SynchronizedTranscript text={place[`transcript_${lang}`] || ''}
        cues={place[`transcript_cues_${lang}`]} audio={audio} lang={lang} />
    </section>
  );
}

export default function PlaceDetail() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, place: null, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/api/landmarks/${encodeURIComponent(id)}?lang=vi`, { signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? 'Không tìm thấy địa danh.' : 'Không tải được địa danh.');
        const json = await response.json();
        if (!json.data) throw new Error('API chưa trả về địa danh.');
        if (!controller.signal.aborted) setResult({ id, place: json.data, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ id, place: null, error: error.message });
      }
    }
    void load();
    return () => controller.abort();
  }, [id]);
  const place = result.id === id ? result.place : null;
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <Link to="/places">← Danh sách địa danh</Link>
      {result.id !== id && <p>Đang tải nội dung...</p>}
      {result.id === id && result.error && <p role="alert">{result.error}</p>}
      {place && <>
        <h1>{place.title_vi}</h1>
        <p>{place.subtitle_vi}</p>
        {place.background_image_url && <img src={place.background_image_url} alt={place.title_vi} style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />}
        <p>{place.description_vi}</p>
        <Narration key={`${id}-vi`} place={place} lang="vi" />
        <Narration key={`${id}-en`} place={place} lang="en" />
        {place.images?.length > 0 && <section><h2>Hình ảnh</h2>
          {place.images.map(image => <img key={image.image_id} src={image.image_url} alt={place.title_vi} loading="lazy" style={{ width: 180, height: 180, objectFit: 'cover' }} />)}
        </section>}
      </>}
    </main>
  );
}
