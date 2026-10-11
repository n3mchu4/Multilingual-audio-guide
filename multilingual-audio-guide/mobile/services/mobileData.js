// IPv4 máy tính của bạn khi chạy Expo Go
export const API_BASE_URL = "http://192.168.1.14:5001";

// Ảnh mặc định từ Supabase dự phòng khi chưa load kịp ảnh
const DEFAULT_IMAGE = "https://pckzgrgjqydmflamelau.supabase.co/storage/v1/object/public/image/ben-thanh-market/ben-thanh-market1.jpeg";

export const fetchPlacesFromAPI = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places`);
    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((item) => ({
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
          en: item.audio_en_url || item.audio_vi_url,
        },
        image: item.background_image_url || DEFAULT_IMAGE,
        gallery: [],
        time: "5–7 phút",
        bus: "Tuyến buýt Bến Thành - Quận 1",
        dist: "Gần bạn",
      }));
    }
  } catch (error) {
    console.error("Lỗi gọi API places:", error);
  }
  return null;
};

// Dữ liệu mặc định dự phòng
export const places = [
  {
    id: "ben-thanh-market",
    name: { vi: "Chợ Bến Thành", en: "Ben Thanh Market" },
    short: { vi: "Biểu tượng Sài Gòn", en: "Saigon Icon" },
    desc: { vi: "Nơi giao thoa nhịp sống Sài Gòn...", en: "City market..." },
    history: { vi: "Chợ Bến Thành là điểm đến nổi tiếng...", en: "Ben Thanh Market..." },
    image: DEFAULT_IMAGE,
    gallery: [],
    time: "5–7 phút",
    bus: "Tuyến 01, 03",
    dist: "450m",
  },
  {
    id: "bach-dang-wharf",
    name: { vi: "Bến Bạch Đằng", en: "Bach Dang Wharf" },
    short: { vi: "Công viên bờ sông", en: "Riverside Park" },
    desc: { vi: "Điểm ngắm cảnh sông Sài Gòn thơ mộng.", en: "Scenic spot along the Saigon River." },
    history: { 
      vi: "Bến Bạch Đằng trải dài dọc bờ sông Sài Gòn, sở hữu không gian thoáng đãng và tầm nhìn hướng về phía khu đô thị mới Thủ Thiêm.", 
      en: "Bach Dang Wharf stretches along the Saigon River, offering beautiful views towards the Thu Thiem area." 
    },
    image: DEFAULT_IMAGE,
    gallery: [],
    time: "5–7 phút",
    bus: "Tuyến 02, 04",
    dist: "600m",
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