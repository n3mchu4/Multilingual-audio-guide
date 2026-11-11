import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = [10.777, 106.701];
// OpenStreetMap tiles do not require a CARTO API key.
const TILE_SOURCES = [
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
];
const STYLE = `
.sg-real-map-card .sg-map-shell{position:relative}
.sg-real-map-card .sg-real-map{height:365px;width:100%;background:#e9f4f2;z-index:0;min-height:300px}
.sg-real-map-card .leaflet-container{font-family:inherit}
.sg-real-map-card img.leaflet-tile{max-width:none!important;max-height:none!important}
.sg-real-map-card .sg-gps-floating{position:absolute;right:12px;bottom:20px;z-index:500;border:1px solid #d9e4e6;border-radius:12px;padding:11px;background:white;color:#167d78;font-weight:800;box-shadow:0 3px 12px #0003;min-height:44px;cursor:pointer}
.sg-real-map-card .sg-gps-floating:disabled{opacity:.7}
.sg-real-map-card .sg-map-controls{padding:10px 14px;background:white}
.sg-real-map-card .sg-map-controls small{display:block;color:#65717d;font-size:12px;line-height:1.5}
.sg-real-map-card .sg-map-error{color:#b91c1c;font-size:12px;padding:8px 0;margin:0}
.sg-real-map-card .sg-map-success{color:#167d78;font-size:12px;margin:0 0 6px}
.sg-real-map-card .sg-route-pin{width:30px;height:30px;border:3px solid white;border-radius:50%;color:white;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px #0005}
.sg-route-actions a{display:block;text-align:center;text-decoration:none;padding:12px;margin-top:10px;background:#e9f4f2;color:#167d78;border-radius:10px;font-size:12px;font-weight:700}
@media(max-width:900px){.sg-real-map-card .sg-real-map{height:clamp(300px,50vh,480px)}}
@media(max-width:480px){.sg-real-map-card .sg-real-map{height:340px}}
`;
function coords(p) {
  const a=p?.lat??p?.latitude, b=p?.lng??p?.longitude;
  if(a==null||b==null||a===''||b==='')return null;
  const lat=Number(a),lng=Number(b);
  return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180&&(lat!==0||lng!==0)?[lat,lng]:null;
}
function nameOf(p,lang){return p?.name?.[lang]||p?.name?.vi||p?.title||p?.title_vi||String(p?.id||'');}
function pin(label,color){return L.divIcon({className:'',html:`<div class="sg-route-pin" style="background:${color}">${label}</div>`,iconSize:[30,30],iconAnchor:[15,15]});}
function mapsLink(destination,origin){
  if(!destination)return '';
  const q=new URLSearchParams({api:'1',destination:destination.join(','),travelmode:'driving'});
  if(origin)q.set('origin',origin.join(','));
  return `https://www.google.com/maps/dir/?${q}`;
}
export default function DesktopMap({places=[],lang='vi',tr=k=>k,currentPlace=0,openDetail,detail=false}){
  const el=useRef(null),map=useRef(null),markers=useRef(null),routeLayer=useRef(null),gpsLayer=useRef(null);
  const tileLayer=useRef(null),tileIndex=useRef(0),tileFailures=useRef(0),openDetailRef=useRef(openDetail);
  openDetailRef.current=openDetail;
  const [ready,setReady]=useState(false),[tileError,setTileError]=useState(false);
  const [gps,setGps]=useState(null),[gpsStatus,setGpsStatus]=useState('idle');
  const [from,setFrom]=useState(0),[to,setTo]=useState(places.length>1?1:0);
  const [useGps,setUseGps]=useState(false),[request,setRequest]=useState(null),[status,setStatus]=useState(''),[summary,setSummary]=useState(null);
  const vi=lang==='vi';
  const selectedFrom=Math.min(from,Math.max(places.length-1,0)),selectedTo=Math.min(to,Math.max(places.length-1,0));
  const selectTiles=(instance,index)=>{
    const oldLayer=tileLayer.current;
    tileIndex.current=index;
    tileFailures.current=0;
    const layer=L.tileLayer(TILE_SOURCES[index],{
      attribution:'&copy; OpenStreetMap contributors',
      maxZoom:19,keepBuffer:1,updateWhenIdle:true,
    });
    tileLayer.current=layer;
    layer.on('tileload',()=>{
      if(tileLayer.current!==layer)return;
      tileFailures.current=0;
      setTileError(false);
    });
    layer.on('tileerror',()=>{
      if(tileLayer.current!==layer)return;
      tileFailures.current+=1;
      if(tileFailures.current>=4){
        if(index<TILE_SOURCES.length-1){
          selectTiles(instance,index+1);
        }else{
          setTileError(true);
        }
      }
    });
    layer.addTo(instance);
    if(oldLayer && instance.hasLayer(oldLayer))instance.removeLayer(oldLayer);
    setTileError(false);
  };
  useEffect(()=>{
    if(!el.current||map.current)return;
    const instance=L.map(el.current,{zoomControl:true,minZoom:3,maxZoom:19,preferCanvas:true,scrollWheelZoom:false}).setView(CENTER,13);
    map.current=instance;
    selectTiles(instance,0);
    markers.current=L.layerGroup().addTo(instance);
    routeLayer.current=L.layerGroup().addTo(instance);
    gpsLayer.current=L.layerGroup().addTo(instance);
    setReady(true);
    let observer;
    if(typeof ResizeObserver!=='undefined'){
      observer=new ResizeObserver(()=>instance.invalidateSize({pan:false,debounceMoveend:true}));
      observer.observe(el.current);
    }
    const refresh=()=>instance.invalidateSize({pan:false});
    window.addEventListener('resize',refresh);
    window.addEventListener('orientationchange',refresh);
    const timeout=setTimeout(refresh,350);
    const delayed=setTimeout(refresh,1200);
    const visibilityObserver=typeof IntersectionObserver!=='undefined'
      ?new IntersectionObserver(entries=>{
          if(entries.some(entry=>entry.isIntersecting)){
            requestAnimationFrame(()=>instance.invalidateSize({pan:false}));
          }
        },{threshold:0.01})
      :null;
    visibilityObserver?.observe(el.current);
    return ()=>{
      clearTimeout(timeout);clearTimeout(delayed);
      window.removeEventListener('resize',refresh);
      window.removeEventListener('orientationchange',refresh);
      visibilityObserver?.disconnect();observer?.disconnect();instance.remove();
      map.current=null;markers.current=null;routeLayer.current=null;gpsLayer.current=null;tileLayer.current=null;
    };
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const timer=setTimeout(()=>map.current?.invalidateSize({pan:false}),200);
    return ()=>clearTimeout(timer);
  },[ready,detail]);
  useEffect(()=>{
    if(!ready||!markers.current)return;
    markers.current.clearLayers();
    places.forEach((p,i)=>{
      const pt=coords(p);if(!pt)return;
      const marker=L.marker(pt,{icon:pin('•',i===currentPlace?'#d63384':'#167d78')});
      marker.bindTooltip(nameOf(p,lang),{direction:'top'});
      marker.on('click',()=>openDetailRef.current?.(i));
      marker.addTo(markers.current);
    });
  },[ready,places,lang,currentPlace]);
  useEffect(()=>{
    if(!ready||!gps||!gpsLayer.current)return;
    gpsLayer.current.clearLayers();
    L.circleMarker(gps,{radius:9,color:'white',weight:3,fillColor:'#2389ef',fillOpacity:1})
      .bindTooltip(vi?'Vị trí của tôi':'My location').addTo(gpsLayer.current);
  },[ready,gps,vi]);
  const locate=()=>{
    if(gps){map.current?.flyTo(gps,16,{duration:.5});return;}
    if(!navigator.geolocation||!window.isSecureContext){setGpsStatus('unsupported');return;}
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      p=>{const pt=[p.coords.latitude,p.coords.longitude];setGps(pt);setGpsStatus('ok');map.current?.flyTo(pt,16,{duration:.6});},
      e=>setGpsStatus(e.code===1?'denied':'error'),
      {enableHighAccuracy:true,timeout:15000,maximumAge:10000}
    );
  };
  useEffect(()=>{
    if(!ready||!request||!routeLayer.current)return;
    routeLayer.current.clearLayers();setSummary(null);
    const start=request.gps?request.origin:coords(places[request.from]),end=coords(places[request.to]);
    if(!request.gps&&request.from===request.to){setStatus(vi?'Chọn hai địa danh khác nhau.':'Choose two different landmarks.');return;}
    if(!start||!end){setStatus(vi?'Thiếu tọa độ hợp lệ.':'Missing valid coordinates.');return;}
    const controller=new AbortController();
    setStatus(vi?'Đang tìm đường xe chạy...':'Finding driving route...');
    const url=`https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=false`;
    fetch(url,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{
      if(controller.signal.aborted)return;
      if(data.code!=='Ok'||!data.routes?.[0]?.geometry?.coordinates?.length)throw Error('No route');
      const result=data.routes[0],points=result.geometry.coordinates.map(([lng,lat])=>[lat,lng]);
      L.polyline(points,{color:'#d63384',weight:5,opacity:.9}).addTo(routeLayer.current);
      L.marker(start,{icon:pin('A','#16a34a')}).addTo(routeLayer.current);
      L.marker(end,{icon:pin('B','#dc2626')}).addTo(routeLayer.current);
      map.current?.invalidateSize({pan:false});map.current?.fitBounds(L.latLngBounds(points),{padding:[30,30],maxZoom:16});
      setSummary({km:(result.distance/1000).toFixed(1),minutes:Math.round(result.duration/60)});setStatus('');
    }).catch(()=>{if(!controller.signal.aborted)setStatus(vi?'Không tải được tuyến đường. Thử Google Maps.':'Route unavailable. Try Google Maps.');});
    return ()=>controller.abort();
  },[ready,request,places,lang,vi]);
  const startRoute=()=>{
    if(useGps&&!gps){setStatus(vi?'Hãy lấy GPS trước khi tìm đường.':'Get your GPS location first.');locate();return;}
    setRequest({from:selectedFrom,to:selectedTo,gps:useGps,origin:useGps?[...gps]:null,nonce:Date.now()});
  };
  const origin=request?(request.gps?request.origin:coords(places[request.from])):(useGps?gps:coords(places[selectedFrom]));
  const destination=coords(places[request?.to??selectedTo]);
  const googleUrl=mapsLink(destination,origin);
  return <>
    <style>{STYLE}</style>
    <div className="map-card sg-real-map-card">
      <div className="map-top"><h3>{tr('mapTitle')}</h3><span>{vi?'Bản đồ địa danh Quận 1':'District 1 landmarks'}</span></div>
      <div className="sg-map-shell">
        <div className="sg-real-map" ref={el} role="application" aria-label={vi?'Bản đồ địa danh':'Landmark map'}/>
        <button className="sg-gps-floating" type="button" onClick={locate} disabled={gpsStatus==='loading'}>
          {gpsStatus==='loading'?(vi?'Đang lấy GPS...':'Locating...'):(vi?'📍 Vị trí của tôi':'📍 My location')}
        </button>
      </div>
      <div className="sg-map-controls">
        {tileError&&<p className="sg-map-error" role="alert">{vi?'Không tải được nền bản đồ. Kiểm tra mạng hoặc thử lại.':'Map tiles unavailable. Check your network or retry.'} <button type="button" onClick={()=>map.current&&selectTiles(map.current,0)}>{vi?'Thử lại':'Retry'}</button></p>}
        {gpsStatus==='ok'&&<p className="sg-map-success" role="status">{vi?'Đã xác định GPS (chấm xanh).':'GPS found (blue dot).'}</p>}
        {gpsStatus==='denied'&&<p className="sg-map-error">{vi?'Hãy cấp quyền vị trí cho trình duyệt trong Cài đặt iPhone.':'Allow location for the browser in iPhone Settings.'}</p>}
        {gpsStatus==='unsupported'&&<p className="sg-map-error">{vi?'GPS cần HTTPS hoặc localhost.':'GPS requires HTTPS or localhost.'}</p>}
        {gpsStatus==='error'&&<p className="sg-map-error">{vi?'Không lấy được GPS. Bật định vị rồi thử lại.':'GPS unavailable. Enable location and retry.'}</p>}
        <small>{vi?'Chạm để kéo, phóng to và chọn địa danh.':'Touch to pan, zoom and select landmarks.'}</small>
      </div>
      {!detail&&<div className="map-legend"><span><i className="legend-dot"/>{tr('mapLegend')}</span></div>}
    </div>
    <div className="route-card">
      <h3>{tr('routeTitle')}</h3>
      <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:12}}>
        <input type="checkbox" checked={useGps} onChange={e=>setUseGps(e.target.checked)}/>{vi?'Xuất phát từ GPS của tôi':'Start from my GPS'}
      </label>
      {!useGps&&<select className="route-input" aria-label={tr('routeFrom')} value={selectedFrom} onChange={e=>setFrom(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>}
      <select className="route-input" aria-label={tr('routeTo')} value={selectedTo} onChange={e=>setTo(Number(e.target.value))}>
        {places.map((p,i)=><option key={p.id||i} value={i}>{nameOf(p,lang)}</option>)}
      </select>
      <button type="button" className="primary-btn" style={{width:'100%',padding:11}} disabled={!places.length} onClick={startRoute}>{tr('routeBtn')}</button>
      {status&&<p className="sg-map-error" role="status">{status}</p>}
      {request&&<div className="route-result"><strong>↗ {tr('routeResultTitle')}</strong><div>{request.gps?(vi?'Vị trí của tôi':'My location'):nameOf(places[request.from],lang)} → {nameOf(places[request.to],lang)}</div>
        {summary&&<p>{summary.km} km · {summary.minutes} {vi?'phút (ước tính)':'min (estimated)'}</p>}
        <p>{vi?'Tuyến đường ô tô tham khảo, không có giao thông trực tiếp.':'Reference car route, without live traffic.'}</p>
      </div>}
      <div className="sg-route-actions">{googleUrl&&<a href={googleUrl} target="_blank" rel="noopener noreferrer">{vi?'Mở Google Maps chỉ đường':'Open directions in Google Maps'}</a>}</div>
    </div>
  </>;
}
