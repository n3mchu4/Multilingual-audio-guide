
const R = 6371000;

export function getNearbyPOIs(places, selectedId, radius = 100) {
  const selected = places.find(p => p.id === selectedId);
  if (!selected) return [];

  const lat1 = Number(selected.lat);
  const lng1 = Number(selected.lng);
  if (!Number.isFinite(lat1) || !Number.isFinite(lng1)) return [];

  const rad = n => n * Math.PI / 180;

  return places
    .filter(p => p.id !== selectedId)
    .map(p => {
      const lat2 = Number(p.lat);
      const lng2 = Number(p.lng);
      if (!Number.isFinite(lat2) || !Number.isFinite(lng2)) return null;

      const dLat = rad(lat2 - lat1);
      const dLng = rad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
        Math.sin(dLng / 2) ** 2;

      const distance = 2 * R *
        Math.asin(Math.sqrt(Math.min(1, a)));

      return {
        ...p,
        distance,
        status: distance <= 10 ? 'DUPLICATE' : 'NEARBY'
      };
    })
    .filter(p => p && p.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}
