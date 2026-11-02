import { useEffect, useRef, useState } from 'react';
// Cài bằng: npm i leaflet  (bundle theo app, không còn tải từ unpkg)
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_STYLES = `/* Chỉ áp dụng cho bản đồ thật, không thay đổi CSS toàn website. */
.sg-real-map-card .sg-real-map { height: 365px; width: 100%; background: #e9f4f2; z-index: 0; }
.sg-real-map-card .sg-map-error { padding: 10px; color: #b91c1c; }
.sg-leaflet-pin-wrap { background: transparent; border: 0; }
.sg-leaflet-pin { display: block; position: relative; width: 26px; height: 26px; border: 3px solid white; border-radius: 50% 50% 50% 0; background: #167d78; transform: rotate(-45deg); box-shadow: 0 2px 8px #0005; }
.sg-leaflet-pin.selected { background: #d63384; }
.sg-leaflet-pin span { display: block; position: absolute; width: 7px; height: 7px; border-radius: 50%; background: white; left: 7px; top: 7px; }
.sg-real-map-card .leaflet-container { font-family: inherit; }
.sg-real-map-card img.leaflet-tile { max-width: none !important; max-height: none !important; }
.sg-real-map-card .leaflet-pane img { max-width: none; }
.sg-real-map-card .leaflet-container img { display: block; }
@media (max-width: 900px) { .sg-real-map-card .sg-real-map { height: 290px; } }
`;

const CENTER = [10.777, 106.701];

// CARTO Voyager: CDN nhanh, có subdomain a-d để tải song song.
// Nếu muốn dùng lại OSM: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' (bỏ subdomains)
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
function coords(place) {
  const lat = Number(place?.lat ?? place?.latitude);
  const lng = Number(place?.lng ?? place?.longitude);
  const hasValues = (place?.lat != null && place?.lng != null) || (place?.latitude != null && place?.longitude != null);
  return hasValues && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

function icon(active) {
  return L.divIcon({
    className: 'sg-leaflet-pin-wrap',
    html: `<span class="sg-leaflet-pin ${active ? 'selected' : ''}"><span></span></span>`,
    iconSize: [28, 38], iconAnchor: [14, 36], popupAnchor: [0, -32],
  });
}

export default function DesktopMap({ places = [], lang = 'vi', tr = key => key, currentPlace = 0, openDetail, detail = false }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  const line = useRef(null);
  // Giữ giá trị mới nhất qua ref để effect không phải chạy lại khi cha tạo hàm mới mỗi lần render.
  const openDetailRef = useRef(openDetail);
  openDetailRef.current = openDetail;
  const langRef = useRef(lang);
  langRef.current = lang;

  const [error, setError] = useState('');
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(places.length > 2 ? 2 : Math.min(1, places.length - 1));
  const [route, setRoute] = useState(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const selectedFrom = Math.min(from, Math.max(0, places.length - 1));
  const selectedTo = Math.min(to, Math.max(0, places.length - 1));

  // Khởi tạo bản đồ (đồng bộ, không còn chờ tải thư viện)
  useEffect(() => {
    if (!container.current) return undefined;
    let cancelled = false;

    const instance = L.map(container.current, {
      zoomControl: true,
      preferCanvas: true,
      minZoom: 12,
      maxZoom: 19,
    }).setView(CENTER, 13);

    const baseLayer = L.tileLayer(TILE_URL, {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
  tileSize: 256,
  keepBuffer: 1,
  updateWhenIdle: true,
  updateWhenZooming: false,
});

    let failedTiles = 0;
    baseLayer.on('tileerror', () => {
      failedTiles += 1;
      setError(langRef.current === 'vi'
        ? 'Một số ô bản đồ không tải được. Kiểm tra kết nối Internet.'
        : 'Some map tiles failed to load. Check your connection.');
    });
    baseLayer.on('load', () => { failedTiles = 0; setError(''); });
    baseLayer.addTo(instance);

    map.current = instance;
    markers.current = L.layerGroup().addTo(instance);
    setReady(true);

    // Tính lại kích thước khi khung bản đồ ổn định
    const raf = requestAnimationFrame(() => {
      if (!cancelled) instance.invalidateSize({ pan: false });
    });
    const resizeTimer = setTimeout(() => {
      if (!cancelled) instance.invalidateSize({ pan: false });
    }, 250);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      instance.remove();
      map.current = null;
      markers.current = null;
      line.current = null;
    };
  }, []);

  // Vẽ marker (không phụ thuộc openDetail nữa -> không bị vẽ lại vô ích)
  useEffect(() => {
    if (!ready || !map.current || !markers.current) return;
    markers.current.clearLayers();
    places.forEach((place, index) => {
      const point = coords(place);
      if (!point) return;
      const marker = L.marker(point, { icon: icon(index === currentPlace) });
      marker.bindTooltip(place.name?.[lang] || place.title || place.id || '', { direction: 'top' });
      marker.on('click', () => openDetailRef.current?.(index));
      markers.current.addLayer(marker);
    });
  }, [places, lang, currentPlace, ready]);

  // Đường nối tham khảo giữa 2 địa danh
  useEffect(() => {
    if (!ready || !map.current) return;
    if (line.current) { map.current.removeLayer(line.current); line.current = null; }
    if (!route || route[0] === route[1]) return;
    const a = coords(places[route[0]]);
    const b = coords(places[route[1]]);
    if (!a || !b) return;
    // Đường nối vị trí tham khảo, không phải chỉ đường theo đường giao thông.
    line.current = L.polyline([a, b], { color: '#d63384', weight: 4, dashArray: '8 7' }).addTo(map.current);
    map.current.fitBounds(line.current.getBounds().pad(0.35), { maxZoom: 16 });
  }, [route, places, ready]);

  return <>
    <style>{MAP_STYLES}</style>
    <div className="map-card sg-real-map-card">
      <div className="map-top"><h3>{tr('mapTitle')}</h3><span>{lang === 'vi' ? 'Bản đồ địa danh Quận 1' : 'District 1 landmarks'}</span></div>
      <div style={{ position: 'relative', height: 365 }}>
        <div className="sg-real-map" ref={container} role="application" aria-label={lang === 'vi' ? 'Bản đồ địa danh' : 'Landmark map'} style={{ display: fallback ? 'none' : 'block' }} />
        {fallback && <div style={{ height: '100%', overflow: 'auto', padding: 16, background: '#e9f4f2' }}>
          <strong>{lang === 'vi' ? 'Danh sách địa danh Quận 1' : 'District 1 landmarks'}</strong>
          <p style={{ fontSize: 12 }}>{lang === 'vi' ? 'Không tải được bản đồ trực tuyến. Bạn vẫn có thể chọn địa danh bên dưới.' : 'Online map unavailable. You can still select a landmark below.'}</p>
          {places.map((p, i) => <button key={p.id || i} type="button" onClick={() => openDetail?.(i)} style={{ display: 'block', width: '100%', padding: 10, marginBottom: 6, border: '1px solid #b5d7d2', borderRadius: 8, background: 'white', textAlign: 'left', cursor: 'pointer' }}>{i + 1}. {p.name?.[lang] || p.id}</button>)}
        </div>}
      </div>
      {error && <p className="sg-map-error" role="alert">{error}</p>}
      {!detail && <div className="map-legend"><span><i className="legend-dot" />{tr('mapLegend')}</span></div>}
    </div>
    <div className="route-card">
      <h3>{tr('routeTitle')}</h3>
      <select className="route-input" aria-label={tr('routeFrom')} value={selectedFrom} onChange={e => { const n = Number(e.target.value); setFrom(n); setRoute([n, selectedTo]); }}>
        {places.map((p, i) => <option key={p.id} value={i}>{p.name?.[lang] || p.id}</option>)}
      </select>
      <select className="route-input" aria-label={tr('routeTo')} value={selectedTo} onChange={e => { const n = Number(e.target.value); setTo(n); setRoute([selectedFrom, n]); }}>
        {places.map((p, i) => <option key={p.id} value={i}>{p.name?.[lang] || p.id}</option>)}
      </select>
      <button type="button" className="primary-btn" style={{ width: '100%', padding: 11 }} onClick={() => setRoute([selectedFrom, selectedTo])}>{tr('routeBtn')}</button>
      {route && <div className="route-result">{route[0] === route[1] ? tr('routeSame') : <><strong>↗ {tr('routeResultTitle')}</strong>{places[route[0]]?.name?.[lang]} → {places[route[1]]?.name?.[lang]}<p>{lang === 'vi' ? 'Đường nối vị trí tham khảo, không phải lộ trình giao thông.' : 'Straight-line reference, not road directions.'}</p></>}</div>}
      <div style={{ fontSize: 10, color: '#8b969a', lineHeight: 1.6, marginTop: 10 }}>{tr('routeNote')}</div>
    </div>
  </>;
}