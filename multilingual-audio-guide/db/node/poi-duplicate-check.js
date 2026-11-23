
const EARTH_RADIUS = 6371000;

function normalizeName(name = "") {
  return String(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function calculateDistance(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function checkNearbyPOIs(newPOI, existingPOIs) {
  const lat = Number(newPOI.latitude ?? newPOI.lat);
  const lng = Number(newPOI.longitude ?? newPOI.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    throw new Error("Tọa độ POI không hợp lệ");
  }

  const results = [];

  for (const poi of existingPOIs) {
    const oldLat = Number(poi.latitude ?? poi.lat);
    const oldLng = Number(poi.longitude ?? poi.lng);

    if (!Number.isFinite(oldLat) || !Number.isFinite(oldLng)) {
      continue;
    }

    const distance = calculateDistance(
      lat, lng, oldLat, oldLng
    );

    const sameName =
      normalizeName(newPOI.title_vi ?? newPOI.name) ===
      normalizeName(poi.title_vi ?? poi.name);

    let status = null;

    if (distance <= 10 || (sameName && distance <= 30)) {
      status = "DUPLICATE";
    } else if (distance <= 100) {
      status = "NEARBY";
    }

    if (status) {
      results.push({
        id: poi.landmark_id ?? poi.id,
        name: poi.title_vi ?? poi.name,
        distance: Math.round(distance),
        status
      });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
}

module.exports = { checkNearbyPOIs };
