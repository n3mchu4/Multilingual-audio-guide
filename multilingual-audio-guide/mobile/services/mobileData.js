// Dữ liệu mẫu giữ lại từ HTML gốc; chưa kết nối API.
export const places = [
  {
    name: {
      vi: "Chợ Bến Thành",
      en: "Ben Thanh Market",
    },
    short: {
      vi: "Biểu tượng giao thương của Sài Gòn",
      en: "A landmark of Saigon commerce",
    },
    desc: {
      vi: "Nơi giao thoa nhịp sống và ẩm thực địa phương.",
      en: "One of the city’s best-known markets.",
    },
    history: {
      vi: "Chợ Bến Thành là điểm đến quen thuộc của người dân và du khách khi khám phá trung tâm Sài Gòn.",
      en: "Ben Thanh Market is a familiar stop for residents and visitors.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Thanh%20Market%20(36327758224).jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ben%20Thanh%20Market%20(36350099003).jpg",
    ],
    time: "5–7 phút",
    bus: "Tuyến 01, 03, 19, 56, 152 (Trạm Chợ Bến Thành)",
    dist: "450m · Đi bộ 6 phút",
  },
  {
    name: {
      vi: "Bến Bạch Đằng",
      en: "Bach Dang Wharf",
    },
    short: {
      vi: "Khoảng xanh bên dòng sông Sài Gòn",
      en: "A riverside promenade",
    },
    desc: {
      vi: "Không gian ven sông ngắm nhìn thành phố nhộn nhịp.",
      en: "An open riverside promenade for watching boats.",
    },
    history: {
      vi: "Bến Bạch Đằng nằm dọc bờ sông Sài Gòn, điểm đi dạo và ngắm tàu thuyền thư giãn.",
      en: "Bach Dang Wharf stretches along the Saigon River in the city center.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bach%20Dang%20Quay%20(52681304130).jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Bach%20Dang%20Quay%20(52681363335).jpg",
    ],
    time: "3–5 phút",
    bus: "Tuyến 03, 19, 88 (Trạm Công trường Mê Linh)",
    dist: "800m · Đi bộ 10 phút",
  },
  {
    name: {
      vi: "Dinh Độc Lập",
      en: "Independence Palace",
    },
    short: {
      vi: "Dấu mốc lịch sử hiện đại",
      en: "Modern history landmark",
    },
    desc: {
      vi: "Công trình kiến trúc gắn liền với lịch sử dân tộc.",
      en: "A historic architectural landmark.",
    },
    history: {
      vi: "Dinh Độc Lập giữ vị trí đặc biệt trong lịch sử Việt Nam, nổi bật với khuôn viên xanh rộng rãi.",
      en: "Independence Palace holds a distinctive place in modern Vietnamese history.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Independence%20Palace%20(11434509833).jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Independence%20Palace%20(13663546815).jpg",
    ],
    time: "7–10 phút",
    bus: "Tuyến 05, 30, 152 (Trạm Dinh Độc Lập)",
    dist: "600m · Đi bộ 8 phút",
  },
  {
    name: {
      vi: "Nhà thờ Đức Bà",
      en: "Notre-Dame Cathedral",
    },
    short: {
      vi: "Dấu ấn kiến trúc trung tâm",
      en: "Striking cathedral landmark",
    },
    desc: {
      vi: "Công trình kiến trúc Pháp cổ kính gạch đỏ.",
      en: "A European-inspired architectural landmark.",
    },
    history: {
      vi: "Nhà thờ Đức Bà Sài Gòn nổi bật với 2 tháp chuông và lớp gạch nung màu đỏ đặc trưng.",
      en: "Notre-Dame Cathedral Basilica of Saigon is an architectural landmark.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/20190923%20Notre-Dame%20Cathedral%20Basilica%20of%20Saigon-1.jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/20190923%20Notre-Dame%20Cathedral%20Basilica%20of%20Saigon-2.jpg",
    ],
    time: "4–6 phút",
    bus: "Tuyến 18, 30, 36 (Trạm Bưu điện TP)",
    dist: "750m · Đi bộ 9 phút",
  },
  {
    name: {
      vi: "Bưu điện Trung tâm",
      en: "Central Post Office",
    },
    short: {
      vi: "Vẻ đẹp cổ điển Sài Gòn",
      en: "Classic architecture",
    },
    desc: {
      vi: "Bưu điện mái vòm cổ kính nổi tiếng.",
      en: "A grand post office with a vaulted roof.",
    },
    history: {
      vi: "Bưu điện Trung tâm Sài Gòn gây ấn tượng với hệ thống mái vòm cao và kiến trúc châu Âu.",
      en: "Saigon Central Post Office stands near Notre-Dame Cathedral.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/20190923%20Saigon%20Central%20Post%20Office%20entrance-1.jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/20190923%20Saigon%20Central%20Post%20Office%20entrance-2.jpg",
    ],
    time: "4–6 phút",
    bus: "Tuyến 18, 30, 36 (Trạm Bưu điện TP)",
    dist: "800m · Đi bộ 10 phút",
  },
  {
    name: {
      vi: "Đường sách",
      en: "Book Street",
    },
    short: {
      vi: "Góc nhỏ người yêu sách",
      en: "A corner for book lovers",
    },
    desc: {
      vi: "Tuyến phố đi bộ rợp bóng cây với hàng sách.",
      en: "A leafy pedestrian street lined with book stalls.",
    },
    history: {
      vi: "Đường sách Nguyễn Văn Bình là không gian văn hóa thư giãn lý tưởng ngay trung tâm.",
      en: "Nguyen Van Binh Book Street is a cultural space for book lovers.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nguyen%20Van%20Binh%20Street%20(52681309899).jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Nguyen%20Van%20Binh%20Street%20(52681309899).jpg",
    ],
    time: "3–5 phút",
    bus: "Tuyến 18, 30, 36 (Trạm Hai Bà Trưng)",
    dist: "850m · Đi bộ 11 phút",
  },
  {
    name: {
      vi: "Nhà hát Thành phố",
      en: "Saigon Opera House",
    },
    short: {
      vi: "Nét duyên nghệ thuật",
      en: "A graceful arts landmark",
    },
    desc: {
      vi: "Nhà hát mang phong cách Pháp lộng lẫy.",
      en: "A French-inspired theater used for performances.",
    },
    history: {
      vi: "Nhà hát Thành phố có kiến trúc trang trí cầu kỳ, tọa lạc trên đường Đồng Khởi sầm uất.",
      en: "Ho Chi Minh City Opera House sits on Dong Khoi Street.",
    },
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ho%20Chi%20Minh%20City%20Opera%20House.jpg",
    gallery: [
      "https://commons.wikimedia.org/wiki/Special:FilePath/Ho%20Chi%20Minh%20City%20Opera%20House.jpg",
    ],
    time: "3–5 phút",
    bus: "Tuyến 02, 19, 45 (Trạm Công trường Lam Sơn)",
    dist: "500m · Đi bộ 7 phút",
  },
];

export const words = {
  vi: {
    welcomeEyebrow: "YOUR CITY, YOUR STORY",
    welcomeStep: "BẮT ĐẦU HÀNH TRÌNH",
    welcomeTitle: "Chạm vào nhịp sống Sài Gòn",
    welcomeDesc: "Khám phá lịch sử Quận 1 qua từng câu chuyện.",
    welcomeHello: "Chào mừng bạn",
    welcomeScript: "welcome",
    welcomePrompt: "Chọn ngôn ngữ thuyết minh bạn muốn sử dụng.",
    continueBtn: "Tiếp tục",
    mapTab: "Bản đồ GPS",
    detailEyebrow: "Thuyết minh",
    settingsTab: "Cài đặt",
    homeEyebrow: "BẢN ĐỒ MINH HỌA · QUẬN 1",
    homeTitle: "Bản đồ Định vị",
    homeSubtitle:
      "Kéo, chụm để thu phóng và xoay. Vị trí GPS, khoảng cách và tuyến đường là dữ liệu mẫu.",
    startNav: "Bắt đầu",
    busConnect: "Xe buýt",
    exitNav: "Thoát",
    backHome: "Danh sách",
    audioTitle: "Thuyết minh audio",
    audioDemo: "Trình phát mô phỏng",
    transcriptTitle: "Nội dung văn bản",
    galleryTitle: "Hình ảnh",
    settingsEyebrow: "PREFERENCES",
    settingsTitle: "Cài đặt",
    languageSettings: "Ngôn ngữ",
    languageSettingsDesc: "Chọn ngôn ngữ giao diện & thuyết minh.",
    selectLanguage: "Sử dụng",
    readMore: "Xem audio thuyết minh →",
    walking: "Tản bộ",
    listen: "Phát audio",
    pause: "Tạm dừng",
  },
  en: {
    welcomeEyebrow: "YOUR CITY, YOUR STORY",
    welcomeStep: "START JOURNEY",
    welcomeTitle: "Feel the rhythm of Saigon",
    welcomeDesc: "Discover the history of District 1, one story at a time.",
    welcomeHello: "Welcome",
    welcomeScript: "discover",
    welcomePrompt: "Choose language for audio guide.",
    continueBtn: "Continue",
    mapTab: "GPS Map",
    detailEyebrow: "Audio",
    settingsTab: "Settings",
    homeEyebrow: "ILLUSTRATIVE MAP · DISTRICT 1",
    homeTitle: "GPS Map Navigation",
    homeSubtitle:
      "Drag, pinch to zoom and rotate. GPS position, distances and routes are illustrative.",
    startNav: "Start",
    busConnect: "Buses",
    exitNav: "Exit",
    backHome: "All Places",
    audioTitle: "Audio guide",
    audioDemo: "Audio simulation",
    transcriptTitle: "Transcript",
    galleryTitle: "Gallery",
    settingsEyebrow: "PREFERENCES",
    settingsTitle: "Settings",
    languageSettings: "Language",
    languageSettingsDesc: "Choose display & audio language.",
    selectLanguage: "Use English",
    readMore: "Listen audio guide →",
    walking: "Self-guided",
    listen: "Play audio",
    pause: "Pause",
  },
};

export const mapPoints = [
  {
    x: 38,
    y: 20,
  },
  {
    x: 12,
    y: 52,
  },
  {
    x: 38,
    y: 42,
  },
  {
    x: 48,
    y: 60,
  },
  {
    x: 52,
    y: 74,
  },
  {
    x: 62,
    y: 28,
  },
  {
    x: 15,
    y: 32,
  },
];

export const userGps = {
  x: 20,
  y: 75,
};
