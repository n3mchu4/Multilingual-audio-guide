import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [10.777, 106.701];
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const STYLE = `
.sg-real-map-card .sg-real-map { height:365px;width:100%;background:#e9f4f2; }
.sg-real-map-card .leaflet-container { z-index:0;font-family:inherit; }
.sg-real-map-card img.leaflet-tile {max-width:none!important;max-height:none!important}
.sg-map-error {color:#b91c1c;font-size:12px;padding:8px}
.sg-route-pin {width:30px;height:30px;border:3px solid white;border-radius:50%;color:white;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0005}
@media(max-width:900px){.sg-real-map-card .sg-real-map{height:290px}}
`;
function coords(place) {
  const rawLat = place?.lat ?? place?.latitude;
  const rawLng = place?.lng ?? place?.longitude;
  if (rawLat == null || rawLng == null || rawLat === '' || rawLng === '') return null;
  const lat = Number(rawLat), lng = Number(rawLng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0) ? [lat, lng] : null;
}
function routeIcon(label, color) {
  return L.divIcon({className:'',html:`<div class="sg-route-pin" style="background:${color}">${label}</div>`,iconSize:[30,30],iconAnchor:[15,15]});
}
function nameOf(p, lang) { return p?.name?.[lang] || p?.title || p?.title_vi || p?.id || ''; }

export default function DesktopMap({places=[],lang='vi',tr=k=>k,currentPlace=0,openDetail,detail=false}) {
  const container = useRef(null), map = useRef(null), markers = useRef(null), routeLayer = useRef(null);
  const openDetailRef = useRef(openDetail); openDetailRef.current = openDetail;
  const [ready,setReady] = useState(false);
  const [from,setFrom] = useState(0), [to,setTo] = useState(places.length>1?1:0);
  const [request,setRequest] = useState(null), [status,setStatus] = useState(''), [summary,setSummary] = useState(null);
  const selectedFrom = Math.min(from,Math.max(places.length-1,0));
  const selectedTo = Math.min(to,Math.max(places.length-1,0));

  useEffect(()=>{
    const el=container.current;
    if(!el || map.current) return;
    const instance=L.map(el,{zoomControl:true,minZoom:12,maxZoom:19}).setView(CENTER,13);
    map.current=instance;
    L.tileLayer(TILE_URL,{attribution:'&copy; OpenStreetMap contributors',maxZoom:19,keepBuffer:2}).addTo(instance);
    markers.current=L.layerGroup().addTo(instance);
    routeLayer.current=L.layerGroup().addTo(instance);
    setReady(true);
    const timer=setTimeout(()=>instance.invalidateSize({pan:false}),200);
    return ()=>{clearTimeout(timer);setReady(false);instance.remove();map.current=null;markers.current=null;routeLayer.current=null;};
  },[]);

  useEffect(()=>{
    if(!ready||!markers.current) return;
    markers.current.clearLayers();
    places.forEach((p,i)=>{
      const point=coords(p); if(!point) return;
      const marker=L.marker(point,{icon:routeIcon('•',i===currentPlace?'#d63384':'#e05252')});
      marker.bindTooltip(nameOf(p,lang),{direction:'top'});
      marker.on('click',()=>openDetailRef.current?.(i));
      markers.current.addLayer(marker);
    });
  },[ready,places,lang,currentPlace]);

  useEffect(()=>{
    if(!ready||!map.current||!routeLayer.current||!request) return;
    const layer=routeLayer.current;
    layer.clearLayers();
    const a=places[request.from],b=places[request.to];
    const start=coords(a),end=coords(b);
    setSummary(null);
    if(request.from===request.to){setStatus(lang==='vi'?'Hãy chọn hai địa danh khác nhau.':'Choose different landmarks.');return;}
    if(!start||!end){setStatus(lang==='vi'?`Thiếu tọa độ hợp lệ: ${!start?nameOf(a,lang):nameOf(b,lang)}. Các marker hiện có vẫn được giữ.`:'Missing valid landmark coordinates.');return;}
    const controller=new AbortController();
    setStatus(lang==='vi'?'Đang tìm đường xe chạy...':'Finding driving route...');
    const url=`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=false`;
    fetch(url,{signal:controller.signal}).then(async res=>{
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then(data=>{
      if(controller.signal.aborted) return;
      if(data.code!=='Ok'||!data.routes?.[0]?.geometry?.coordinates?.length) throw new Error('No route');
      const result=data.routes[0];
      const points=result.geometry.coordinates.map(([lng,lat])=>[lat,lng]);
      L.polyline(points,{color:'#d63384',weight:5,opacity:0.9}).addTo(layer);
      L.marker(start,{icon:routeIcon('A','#16a34a')}).bindPopup(nameOf(a,lang)).addTo(layer);
      L.marker(end,{icon:routeIcon('B','#dc2626')}).bindPopup(nameOf(b,lang)).addTo(layer);
      map.current?.invalidateSize({pan:false});
      map.current?.fitBounds(L.latLngBounds(points),{padding:[30,30],maxZoom:16});
      setSummary({km:(result.distance/1000).toFixed(1),minutes:Math.round(result.duration/60)});
      setStatus('');
    }).catch(err=>{
      if(controller.signal.aborted) return;
      setStatus(lang==='vi'?'Không lấy được đường xe chạy từ OSRM. Vui lòng thử lại.':'Could not load driving route. Please retry.');
    });
    return ()=>controller.abort();
  },[request,ready,places,lang]);

  return <>
    <style>{STYLE}</style>
    <div className="map-card sg-real-map-card">
      <div className="map-top"><h3>{tr('mapTitle')}</h3><span>{lang==='vi'?'Bản đồ địa danh Quận 1':'District 1 landmarks'}</span></div>
      <div className="sg-real-map" ref={container} role="application" aria-label={lang==='vi'?'Bản đồ địa danh':'Landmark map'} />
      {!detail&&<div className="map-legend"><span><i className="legend-dot"/>{tr('mapLegend')}</span></div>}
    </div>
    <div className="route-card">
      <h3>{tr('routeTitle')}</h3>
      <select className="route-input" aria-label={tr('routeFrom')} value={selectedFrom} onChange={e=>setFrom(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>
      <select className="route-input" aria-label={tr('routeTo')} value={selectedTo} onChange={e=>setTo(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>
      <button type="button" className="primary-btn" style={{width:'100%',padding:11}} disabled={places.length<2} onClick={()=>setRequest({from:selectedFrom,to:selectedTo,nonce:Date.now()})}>{tr('routeBtn')}</button>
      {status&&<p className="sg-map-error" role="status">{status}</p>}
      {request&&<div className="route-result"><strong>↗ {tr('routeResultTitle')}</strong><div>{nameOf(places[request.from],lang)} → {nameOf(places[request.to],lang)}</div>
        {summary&&<p>{summary.km} km · {summary.minutes} {lang==='vi'?'phút (ước tính, không tính kẹt xe)':'min (estimated, no live traffic)'}</p>}
        <p>{lang==='vi'?'Tuyến đường ô tô tham khảo theo mạng đường giao thông, không phải chỉ dẫn thời gian thực.':'Reference car route, not live navigation.'}</p>
      </div>}
      <div style={{fontSize:10,color:'#8b969a',lineHeight:1.6,marginTop:10}}>{lang==='vi'?'Tuyến đường ô tô tham khảo. Kiểm tra biển báo và quy định giao thông thực tế.':'Reference car route. Follow actual traffic rules.'}</div>
    </div>
  </>;
}
