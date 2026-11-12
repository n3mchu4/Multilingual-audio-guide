import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function hasCoordinates(place) {
  return (
    Number.isFinite(place?.lat) &&
    Number.isFinite(place?.lng) &&
    Math.abs(place.lat) <= 90 &&
    Math.abs(place.lng) <= 180
  );
}
export default function NavigationMap({ placesList, lang, selected, onSelect, userLoc }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);

  // Khởi tạo bản đồ khi mở tab Bản đồ GPS.
  useEffect(() => {
   const map = L.map(containerRef.current, {
  zoomControl: false,
}).setView([10.777, 106.701], 14);
    map.getContainer().style.backgroundColor = '#f5f2e8';

       const mapTilerKey = process.env.EXPO_PUBLIC_MAPTILER_KEY;

    const onlineLayer = L.tileLayer(
      `https://api.maptiler.com/maps/streets-v4/{z}/{x}/{y}.png?key=${mapTilerKey}`,
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> ' +
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      },
    );

    map.createPane('offlineBasemap');
    map.getPane('offlineBasemap').style.zIndex = '190';

    const offlineLayer = L.geoJSON(null, {
      pane: 'offlineBasemap',
      interactive: false,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
            style: (feature) => {
        const tags = feature.properties ?? {};

        if (tags.natural === 'water' || tags.waterway === 'river') {
          return {
            color: '#76b7d5',
            weight: 1.5,
            fillColor: '#a6d6eb',
            fillOpacity: 1,
          };
        }

        if (tags.highway === 'primary' || tags.highway === 'secondary') {
          return { color: '#e2b85c', weight: 3.5 };
        }

        if (tags.highway === 'tertiary') {
          return { color: '#ead39b', weight: 2.5 };
        }

        return { color: '#c8c1b4', weight: 1.5 };
      },
    });

       let active = true;

    function updateBasemap() {
      if (navigator.onLine) {
        onlineLayer.addTo(map);
      } else {
        onlineLayer.remove();
      }
    }

    async function loadOfflineBasemap() {
      try {
        const mapUrl = new URL('/saigon-offline-map.geojson', location.origin).href;
        const response = await caches.match(mapUrl, {
          cacheName: 'saigon-guide-media-v1',
        });
        if (!response) return;

        const data = await response.json();
        if (!active) return;

        offlineLayer.addData(data);
        offlineLayer.addTo(map);
      } catch (error) {
        console.warn('Could not read offline map', error);
      }
    }

    window.addEventListener('online', updateBasemap);
    window.addEventListener('offline', updateBasemap);
    updateBasemap();
    loadOfflineBasemap();

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    return () => {
      active = false;
      window.removeEventListener('online', updateBasemap);
      window.removeEventListener('offline', updateBasemap);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // Căn khung bản đồ để nhìn thấy các địa danh khi dữ liệu tải xong.
  useEffect(() => {
    const points = placesList
      .filter(hasCoordinates)
      .map((place) => [place.lat, place.lng]);

    if (points.length) {
      mapRef.current?.fitBounds(points, { padding: [24, 24], maxZoom: 16 });
    }
  }, [placesList]);

  // Đồng bộ màu marker và thao tác chọn với màn hình cha.
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers) return;

    markers.clearLayers();

    placesList.forEach((place, index) => {
      if (!hasCoordinates(place)) return;

      const name = document.createElement('span');
      name.textContent = place.name?.[lang] ?? place.name?.vi ?? '';

      const pinColor = selected === index ? '#d63384' : '#167d78';

L.marker([place.lat, place.lng], {
  alt: name.textContent,
  icon: L.divIcon({
    className: '',
    iconSize: [24, 30],
    iconAnchor: [12, 29],
    html: `<span style="
      display:block;width:22px;height:22px;
      background:${pinColor};border:2px solid white;
      border-radius:50% 50% 50% 0;box-sizing:border-box;
      transform:translate(1px,3px) rotate(-45deg);
      box-shadow:0 1px 4px #0004;
    "></span>`,
  }),
})
  .bindTooltip(name)
  .on('click', () => onSelect(index))
  .addTo(markers);
    });
  }, [placesList, lang, selected, onSelect]);
    useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasCoordinates(userLoc)) return;

    const position = [userLoc.lat, userLoc.lng];
    const dot = L.circleMarker(position, {
      radius: 8,
      color: '#fff',
      weight: 2,
      fillColor: '#2563eb',
      fillOpacity: 1,
      interactive: false,
    }).addTo(map);

    map.setView(position, 15);
    return () => dot.remove();
  }, [userLoc]);

  return <div ref={containerRef} style={{ width: '100%', height: 320 }} />;
}