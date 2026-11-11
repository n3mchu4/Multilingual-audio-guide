import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [10.777, 106.701];
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const STYLE = `
.sg-real-map-card .sg-map-shell {position:relative;min-width:0}
.sg-real-map-card .sg-real-map {height:365px;width:100%;background:#e9f4f2;z-index:0;touch-action:pan-x pan-y}
.sg-real-map-card .leaflet-container {font-family:inherit}
.sg-real-map-card img.leaflet-tile {max-width:none!important;max-height:none!important}
.sg-real-map-card .sg-gps-floating {position:absolute;right:12px;bottom:20px;z-index:500;border:1px solid #d9e4e6;border-radius:12px;padding:11px 13px;background:#fff;color:#167d78;font-weight:800;box-shadow:0 3px 12px #0003;min-height:44px;max-width:calc(100% - 24px);cursor:pointer}
.sg-real-map-card .sg-gps-floating:disabled {opacity:.7;cursor:wait}
.sg-real-map-card .sg-map-controls {padding:10px 14px;background:#fff;border-top:1px solid #e8eeee}
.sg-real-map-card .sg-map-controls small {display:block;color:#65717d;font-size:12px;line-height:1.5}
.sg-real-map-card .sg-map-error {color:#b91c1c;font-size:12px;padding:8px 0;margin:0}
.sg-real-map-card .sg-map-success {color:#167d78;font-size:12px;margin:0 0 6px}
.sg-real-map-card .sg-user-location-dot {display:block;width:18px;height:18px;border:3px solid #fff;border-radius:50%;background:#2389ef;box-shadow:0 0 0 6px #2389ef33,0 2px 10px #0005}
.sg-real-map-card .sg-route-pin {width:30px;height:30px;border:3px solid white;border-radius:50%;color:white;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0005}
.sg-route-actions {display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.sg-route-actions a {flex:1;min-width:150px;text-decoration:none;text-align:center;padding:11px 12px;background:#e9f4f2;color:#167d78;border-radius:10px;font-weight:750;font-size:12px}
@media(max-width:900px){.sg-real-map-card .sg-real-map{height:clamp(300px,50vh,480px)}}
@media(max-width:480px){.sg-real-map-card .map-top {gap:8px;flex-wrap:wrap}.sg-real-map-card .sg-real-map{height:340px}.sg-route-actions a{min-width:100%}}
`;
function coords(place) {
  const rawLat = place?.lat ?? place?.latitude;
  const rawLng = place?.lng ?? place?.longitude;
  if (rawLat == null || rawLng == null || rawLat === '' || rawLng === '') return null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0) ? [lat, lng] : null;
}
function routeIcon(label, color) {
  return L.divIcon({className:'',html:`<div class="sg-route-pin" style="background:${color}">${label}</div>`,iconSize:[30,30],iconAnchor:[15,15]});
}
function nameOf(p, lang) { return p?.name?.[lang] || p?.name?.vi || p?.title || p?.title_vi || String(p?.id || ''); }
function directionsUrl(place, origin) {
  const point = coords(place);
  if (!point) return '';
  const params = new URLSearchParams({api:'1',destination:`${point[0]},${point[1]}`,travelmode:'driving'});
  if (origin) params.set('origin',`${origin[0]},${origin[1]}`);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export default function DesktopMap({places=[],lang='vi',tr=k=>k,currentPlace=0,openDetail,detail=false}) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  const routeLayer = useRef(null);
  const gpsLayer = useRef(null);
  const gpsWatch = useRef(null);
  const locationRef = useRef(null);
  const openDetailRef = useRef(openDetail);
  openDetailRef.current = openDetail;
  const [ready,setReady] = useState(false);
  const [from,setFrom] = useState(0);
  const [to,setTo] = useState(places.length>1?1:0);
  const [useGpsStart,setUseGpsStart] = useState(false);
  const [userLocation,setUserLocation] = useState(null);
  const [locStatus,setLocStatus] = useState('idle');
  const [request,setRequest] = useState(null);
  const [status,setStatus] = useState('');
  const [summary,setSummary] = useState(null);
  const selectedFrom = Math.min(from,Math.max(places.length-1,0));
  const selectedTo = Math.min(to,Math.max(places.length-1,0));
  const vi = lang === 'vi';

  useEffect(()=>{
    const el=container.current;
    if(!el || map.current) return;
    const instance=L.map(el,{zoomControl:true,minZoom:3,maxZoom:19,preferCanvas:true,scrollWheelZoom:false}).setView(CENTER,13);
    map.current=instance;
    L.tileLayer(TILE_URL,{attribution:'&copy; OpenStreetMap contributors',maxZoom:19,keepBuffer:1,updateWhenIdle:true}).addTo(instance);
    markers.current=L.layerGroup().addTo(instance);
    routeLayer.current=L.layerGroup().addTo(instance);
    gpsLayer.current=L.layerGroup().addTo(instance);
    setReady(true);
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer=new ResizeObserver(()=>instance.invalidateSize({pan:false,debounceMoveend:true}));
      observer.observe(el);
    }
    const timer=window.setTimeout(()=>instance.invalidateSize({pan:false}),250);
    return ()=>{
      if(observer) observer.disconnect();
      clearTimeout(timer);
      instance.remove();
      map.current=null;
      markers.current=null;
      routeLayer.current=null;
      gpsLayer.current=null;
    };
  },[]);

  useEffect(()=>{
    if(!ready || !map.current) return;
    const timer=window.setTimeout(()=>map.current?.invalidateSize({pan:false}),150);
    return ()=>clearTimeout(timer);
  },[ready,detail]);

  useEffect(()=>{
    if(!ready||!markers.current) return;
    markers.current.clearLayers();
    places.forEach((p,i)=>{
      const point=coords(p);
      if(!point) return;
      const marker=L.marker(point,{icon:routeIcon('•',i===currentPlace?'#d63384':'#167d78')});
      marker.bindTooltip(nameOf(p,lang),{direction:'top'});
      marker.on('click',()=>openDetailRef.current?.(i));
      markers.current.addLayer(marker);
    });
  },[ready,places,lang,currentPlace]);

  // GPS is requested explicitly; it is never sent to the backend or persisted.
  const onMyLocation=useCallback(()=>{
    if(!navigator.geolocation || !window.isSecureContext) {
      setLocStatus('unsupported');
      return;
    }
    if(gpsWatch.current !== null) {
      navigator.geolocation.clearWatch(gpsWatch.current);
      gpsWatch.current=null;
    }
    setLocStatus('loading');
    gpsWatch.current=navigator.geolocation.watchPosition(
      pos=>{
        const point=[pos.coords.latitude,pos.coords.longitude];
        locationRef.current=point;
        setUserLocation(point);
        setLocStatus('ok');
        if(gpsLayer.current) {
          gpsLayer.current.clearLayers();
          L.circleMarker(point,{radius:9,color:'#fff',weight:3,fillColor:'#2389ef',fillOpacity:1})
            .bindTooltip(vi?'Vị trí của tôi':'My location').addTo(gpsLayer.current);
          if(Number.isFinite(pos.coords.accuracy) && pos.coords.accuracy < 2000) {
            L.circle(point,{radius:pos.coords.accuracy,weight:1,color:'#2389ef',fillColor:'#2389ef',fillOpacity:0.09,interactive:false}).addTo(gpsLayer.current);
          }
        }
        if(map.current && !locationRef.initialCentered) {
          map.current.flyTo(point,16,{duration:0.6});
          locationRef.initialCentered=true;
        }
      },
      error=>{
        setLocStatus(error.code===1?'denied':'error');
        if(gpsWatch.current!==null) navigator.geolocation.clearWatch(gpsWatch.current);
        gpsWatch.current=null;
      },
      {enableHighAccuracy:true,timeout:15000,maximumAge:10000}
    );
  },[vi]);

  useEffect(()=>()=> {
    if(gpsWatch.current!==null && navigator.geolocation) navigator.geolocation.clearWatch(gpsWatch.current);
    gpsWatch.current=null;
  },[]);

  const focusGps=()=>{
    if(userLocation && map.current) map.current.flyTo(userLocation,16,{duration:0.5});
    else {
      locationRef.initialCentered=false;
      onMyLocation();
    }
  };

  useEffect(()=>{
    if(!ready||!map.current||!routeLayer.current||!request) return;
    const layer=routeLayer.current;
    layer.clearLayers();
    setSummary(null);
    const origin=request.gps?request.origin:coords(places[request.from]);
    const destination=coords(places[request.to]);
    if(!request.gps && request.from===request.to) {
      setStatus(vi?'Hãy chọn hai địa danh khác nhau.':'Choose different landmarks.');
      return;
    }
    if(!origin||!destination){
      setStatus(vi?'Thiếu tọa độ điểm đi hoặc điểm đến.':'Start or destination coordinates are unavailable.');
      return;
    }
    const controller=new AbortController();
    setStatus(vi?'Đang tìm đường xe chạy...':'Finding driving route...');
    const url=`https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&steps=false`;
    fetch(url,{signal:controller.signal}).then(async res=>{
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then(data=>{
      if(controller.signal.aborted) return;
      if(data.code!=='Ok'||!data.routes?.[0]?.geometry?.coordinates?.length) throw new Error('No route');
      const result=data.routes[0];
      const points=result.geometry.coordinates.map(([lng,lat])=>[lat,lng]);
      L.polyline(points,{color:'#d63384',weight:5,opacity:0.9}).addTo(layer);
      L.marker(origin,{icon:routeIcon('A','#16a34a')}).bindPopup(request.gps?(vi?'Vị trí của tôi':'My location'):nameOf(places[request.from],lang)).addTo(layer);
      L.marker(destination,{icon:routeIcon('B','#dc2626')}).bindPopup(nameOf(places[request.to],lang)).addTo(layer);
      map.current?.invalidateSize({pan:false});
      map.current?.fitBounds(L.latLngBounds(points),{padding:[30,30],maxZoom:16});
      setSummary({km:(result.distance/1000).toFixed(1),minutes:Math.round(result.duration/60)});
      setStatus('');
    }).catch(()=>{
      if(controller.signal.aborted) return;
      setStatus(vi?'Không lấy được đường xe chạy. Hãy thử lại hoặc mở Google Maps.':'Could not load the car route. Retry or open Google Maps.');
    });
    return ()=>controller.abort();
  },[request,ready,places,lang,vi]);

  const startRoute=()=>{
    if(useGpsStart && !userLocation){
      setStatus(vi?'Nhấn “Vị trí của tôi” và cho phép truy cập GPS trước khi tìm đường.':'Tap “My location” and allow GPS access first.');
      focusGps();
      return;
    }
    setRequest({from:selectedFrom,to:selectedTo,gps:useGpsStart,origin:useGpsStart?[...userLocation]:null,nonce:Date.now()});
  };
  const googleOrigin=request?.gps?request.origin:(request?coords(places[request.from]):(useGpsStart?userLocation:coords(places[selectedFrom])));
  const googleDestination=places[request?.to??selectedTo];
  const googleHref=directionsUrl(googleDestination,googleOrigin);

  return <>
    <style>{STYLE}</style>
    <div className="map-card sg-real-map-card">
      <div className="map-top"><h3>{tr('mapTitle')}</h3><span>{vi?'Bản đồ địa danh Quận 1':'District 1 landmarks'}</span></div>
      <div className="sg-map-shell">
        <div className="sg-real-map" ref={container} role="application" aria-label={vi?'Bản đồ địa danh':'Landmark map'} />
        <button type="button" className="sg-gps-floating" onClick={focusGps} disabled={locStatus==='loading'}>
          {locStatus==='loading'?(vi?'Đang lấy GPS...':'Locating...'):(vi?'📍 Vị trí của tôi':'📍 My location')}
        </button>
      </div>
      <div className="sg-map-controls">
        {locStatus==='ok' && <p className="sg-map-success" role="status">{vi?'Đã xác định vị trí GPS (chấm xanh).':'GPS location found (blue dot).'}</p>}
        {locStatus==='denied' && <p className="sg-map-error" role="alert">{vi?'Quyền vị trí đã bị từ chối. Hãy cấp quyền cho trang web trong cài đặt trình duyệt.':'Location permission denied. Enable it in browser settings.'}</p>}
        {locStatus==='unsupported' && <p className="sg-map-error" role="alert">{vi?'GPS trên web cần HTTPS hoặc localhost và trình duyệt có hỗ trợ định vị.':'Web GPS requires HTTPS or localhost and a supported browser.'}</p>}
        {locStatus==='error' && <p className="sg-map-error" role="alert">{vi?'Không lấy được GPS. Hãy bật dịch vụ vị trí và thử lại.':'Could not get GPS. Enable device location and retry.'}</p>}
        <small>{vi?'Chạm để kéo, phóng to và chọn địa danh. GPS hoạt động trên Android/iOS khi dùng HTTPS.':'Touch to pan, zoom and choose landmarks. GPS works on Android/iOS over HTTPS.'}</small>
      </div>
      {!detail&&<div className="map-legend"><span><i className="legend-dot"/>{tr('mapLegend')}</span></div>}
    </div>
    <div className="route-card">
      <h3>{tr('routeTitle')}</h3>
      <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:12}}>
        <input type="checkbox" checked={useGpsStart} onChange={e=>setUseGpsStart(e.target.checked)} />
        {vi?'Xuất phát từ vị trí GPS của tôi':'Start from my GPS location'}
      </label>
      {!useGpsStart && <select className="route-input" aria-label={tr('routeFrom')} value={selectedFrom} onChange={e=>setFrom(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>}
      <select className="route-input" aria-label={tr('routeTo')} value={selectedTo} onChange={e=>setTo(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>
      <button type="button" className="primary-btn" style={{width:'100%',padding:11}} disabled={!places.length} onClick={startRoute}>{tr('routeBtn')}</button>
      {status&&<p className="sg-map-error" role="status">{status}</p>}
      {request&&<div className="route-result">
        <strong>↗ {tr('routeResultTitle')}</strong>
        <div>{request.gps?(vi?'Vị trí của tôi':'My location'):nameOf(places[request.from],lang)} → {nameOf(places[request.to],lang)}</div>
        {summary&&<p>{summary.km} km · {summary.minutes} {vi?'phút (ước tính, không tính kẹt xe)':'min (estimated, no live traffic)'}</p>}
        <p>{vi?'Tuyến đường xe chạy tham khảo, không có thông tin giao thông trực tiếp.':'Reference driving route without live traffic.'}</p>
      </div>}
      <div className="sg-route-actions">
        {googleHref&&<a href={googleHref} target="_blank" rel="noopener noreferrer">{vi?'Mở Google Maps chỉ đường':'Open directions in Google Maps'}</a>}
      </div>
      <div style={{fontSize:11,color:'#65717d',lineHeight:1.6,marginTop:10}}>
        {vi?'Trên Android/iOS, Google Maps có thể mở trong ứng dụng nếu đã cài. Tuân thủ biển báo và quy định giao thông thực tế.':'On Android/iOS, Google Maps may open in its app if installed. Follow road signs and traffic rules.'}
      </div>
    </div>
  </>;
}
