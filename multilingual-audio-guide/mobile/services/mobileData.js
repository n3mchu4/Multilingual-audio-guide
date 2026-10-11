// IPv4 máy tính của bạn khi chạy Expo Go (thay bằng IP Wi-Fi máy bạn nếu chạy thiết bị thật)
export const API_BASE_URL = "http://192.168.1.14:5001";
export const fetchPlacesFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places`);
    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((item, index) => ({
        id: item.landmark_id,
        name: {
          vi: item.title_vi || "Chưa có tên",
          en: item.title_en || item.title_vi || "No title",
        },
        short: {
          vi: item.subtitle_vi || "Địa danh nổi tiếng Quận 1",
          en: item.subtitle_en || "Famous landmark in District 1",
        },
        desc: {
          vi: item.description_vi || "Mô tả đang cập nhật...",
          en: item.description_en || "Description updating...",
        },
        history: {
          vi: item.transcript_vi || "Chưa có bài thuyết minh.",
          en: item.transcript_en || "No transcript available.",
        },
        audioUrl: {
          vi: item.audio_vi_url,
          en: item.audio_en_url,
        },
        image: item.background_image_url || "https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Thanh%20Market%20(36327758224).jpg",
        gallery: [],
        time: "5–7 phút",
        bus: "Tuyến buýt Quận 1",
        dist: "Gần bạn",
      }));
    }
  } catch (error) {
    console.error("Lỗi gọi API places:", error);
  }
  return null;
};

// Dữ liệu mặc định dự phòng khi chưa load xong API
export const places = [
  {
    id: "ben-thanh",
    name: { vi: "Chợ Bến Thành", en: "Ben Thanh Market" },
    short: { vi: "Biểu tượng Sài Gòn", en: "Saigon Icon" },
    desc: { vi: "Nơi giao thoa nhịp sống...", en: "City market..." },
    history: { vi: "Chợ Bến Thành là điểm đến...", en: "Ben Thanh Market..." },
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Thanh%20Market%20(36327758224).jpg",
    gallery: [],
    time: "5–7 phút",
    bus: "Tuyến 01, 03",
    dist: "450m",
  }
];

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
    busConnect: "Xe buýt",
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
    busConnect: "Buses",
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

export const mapPoints = [
  { x: 38, y: 20 },
  { x: 12, y: 52 },
  { x: 38, y: 42 },
  { x: 48, y: 60 },
  { x: 52, y: 74 },
  { x: 62, y: 28 },
  { x: 15, y: 32 },
];

export const userGps = { x: 20, y: 75 };