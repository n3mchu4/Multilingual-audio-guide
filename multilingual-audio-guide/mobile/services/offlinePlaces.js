import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './apiClient';

const VERSION = 1;
const CACHE_KEY = `guide.places.v${VERSION}:${API_BASE_URL}`;

// Kiểm tra cấu trúc nội dung trước khi lưu hoặc hiển thị lại.
function validPlaces(places) {
  if (!Array.isArray(places)) return false;

  const ids = new Set();

  return places.every((place) => {
    if (
      !place ||
      typeof place.id !== 'string' ||
      !place.id ||
      ids.has(place.id)
    ) {
      return false;
    }

    ids.add(place.id);

    return (
      ['name', 'short', 'desc', 'history', 'audioUrl'].every(
        (field) =>
          typeof place[field]?.vi === 'string' &&
          typeof place[field]?.en === 'string'
      ) &&
      typeof place.image === 'string' &&
      Array.isArray(place.gallery) &&
      place.gallery.every((url) => typeof url === 'string')
    );
  });
}

// Đọc nội dung đã lưu; bỏ qua bản hỏng hoặc khác phiên bản.
export async function readSavedPlaces() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);

    if (
      saved?.version !== VERSION ||
      saved.apiBaseUrl !== API_BASE_URL ||
      !Number.isFinite(saved.savedAt) ||
      saved.savedAt <= 0 ||
      !validPlaces(saved.places)
    ) {
      return null;
    }

    return {
      places: saved.places,
      savedAt: saved.savedAt,
    };
  } catch {
    return null;
  }
}

// Lưu danh sách và văn bản; ảnh/audio mới chỉ lưu URL.
export async function savePlaces(places) {
  if (!validPlaces(places)) return false;

  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        version: VERSION,
        apiBaseUrl: API_BASE_URL,
        savedAt: Date.now(),
        places,
      })
    );

    return true;
  } catch {
    return false;
  }
}