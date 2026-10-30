import { apiGet, API_BASE_URL } from "./apiClient";

export { API_BASE_URL };

// Toạ độ dự phòng (xấp xỉ) nếu API/CSDL chưa trả latitude/longitude.
const FALLBACK_COORDS = {
  "ben-thanh-market": { lat: 10.772461, lng: 106.698055 },
  "independence-palace": { lat: 10.776889, lng: 106.695278 },
  "notre-dame-cathedral": { lat: 10.779785, lng: 106.699018 },
  "central-post-office": { lat: 10.779953, lng: 106.699868 },
  "bach-dang-wharf": { lat: 10.773200, lng: 106.706800 },
  "saigon-opera-house": { lat: 10.776611, lng: 106.703056 },
  "nguyen-van-binh-book-street": { lat: 10.780030, lng: 106.699660 },
};

export const fetchPlacesFromAPI = async () => {
  const json = await apiGet("/api/landmarks?lang=vi");
  if (!Array.isArray(json.data)) throw new Error("API không trả về danh sách địa danh hợp lệ.");
  return json.data.map((item) => ({
    id: item.id,
    name: {
      vi: item.title_vi || "Chưa có tên",
      en: item.title_en || item.title_vi || "No title",
    },
    short: {
      vi: item.subtitle_vi || "",
      en: item.subtitle_en || "",
    },
    desc: {
      vi: item.description_vi || "",
      en: item.description_en || "",
    },
    transcriptCues: {
      vi: item.transcript_cues_vi || [],
      en: item.transcript_cues_en || [],
    },
    history: {
      vi: item.transcript_vi || item.description_vi || "",
      en: item.transcript_en || item.description_en || "",
    },
    audioUrl: {
      vi: item.audio_vi_url || "",
      en: item.audio_en_url || "",
    },
    image: item.background_image_url || "",
    gallery: item.images || [],
    lat: item.latitude != null ? Number(item.latitude) : FALLBACK_COORDS[item.id]?.lat ?? null,
    lng: item.longitude != null ? Number(item.longitude) : FALLBACK_COORDS[item.id]?.lng ?? null,
    time: "5–7 phút",
    dist: "",
  }));
};

export const words = {
  vi: {
    welcomeEyebrow: "YOUR CITY, YOUR STORY",
    welcomeStep: "BẮT ĐẦU HÀNH TRÌNH",
    welcomeHello: "Chào mừng bạn",
    welcomeScript: "welcome",
    welcomePrompt: "Chọn ngôn ngữ thuyết minh bạn muốn sử dụng.",
    continueBtn: "Tiếp tục",
    mapTab: "Bản đồ GPS",
    detailEyebrow: "Thuyết minh",
    settingsTab: "Cài đặt",
    homeTitle: "Bản đồ Định vị",
    homeSubtitle: "Dữ liệu địa danh từ PostgreSQL Backend.",
    startNav: "Bắt đầu",
    exitNav: "Thoát",
    backHome: "Danh sách",
    audioTitle: "Thuyết minh audio",
    audioDemo: "Trình phát Audio",
    transcriptTitle: "Nội dung văn bản",
    galleryTitle: "Hình ảnh",
    settingsTitle: "Cài đặt",
    languageSettings: "Ngôn ngữ",
    languageSettingsDesc: "Chọn ngôn ngữ giao diện & thuyết minh.",
    readMore: "Xem audio thuyết minh →",
    walking: "Tản bộ",
    listen: "Phát audio",
    pause: "Tạm dừng",
  },
  en: {
    welcomeEyebrow: "YOUR CITY, YOUR STORY",
    welcomeStep: "START JOURNEY",
    welcomeHello: "Welcome",
    welcomeScript: "discover",
    welcomePrompt: "Choose language for audio guide.",
    continueBtn: "Continue",
    mapTab: "GPS Map",
    detailEyebrow: "Audio",
    settingsTab: "Settings",
    homeTitle: "GPS Map Navigation",
    homeSubtitle: "Landmarks data loaded from PostgreSQL Backend.",
    startNav: "Start",
    exitNav: "Exit",
    backHome: "All Places",
    audioTitle: "Audio guide",
    audioDemo: "Audio Player",
    transcriptTitle: "Transcript",
    galleryTitle: "Gallery",
    settingsTitle: "Settings",
    languageSettings: "Language",
    languageSettingsDesc: "Choose display & audio language.",
    readMore: "Listen audio guide →",
    walking: "Self-guided",
    listen: "Play audio",
    pause: "Pause",
  }
};

// Đủ 7 tọa độ điểm ghim trên bản đồ
export const mapPoints = [
  { x: 38, y: 20 }, // 1. Bưu điện
  { x: 12, y: 52 }, // 2. Chợ Bến Thành
  { x: 38, y: 42 }, // 3. Dinh Độc Lập
  { x: 48, y: 60 }, // 4. Nguyễn Huệ
  { x: 52, y: 74 }, // 5. Bến Bạch Đằng
  { x: 62, y: 28 }, // 6. Nhà hát Thành phố
  { x: 15, y: 32 }, // 7. Nhà thờ Đức Bà
];

export const userGps = { x: 20, y: 75 };