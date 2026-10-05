// Dữ liệu mẫu cho giao diện Admin. Khi có backend, thay bằng các lời gọi trong web/src/services/.
const DEFAULT_PIC = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=240&q=80';

export const pics = {
  'Chợ Bến Thành': 'https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&w=240&q=80',
  'Bến Bạch Đằng': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=240&q=80',
  'Dinh Độc Lập': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=240&q=80',
  'Nhà thờ Đức Bà': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=240&q=80',
  'Bưu điện Trung tâm Sài Gòn':
    'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=240&q=80',
  'Đường sách Nguyễn Văn Bình':
    'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=240&q=80',
  'Nhà hát Thành phố': 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=240&q=80',
};

export function pic(name) {
  return pics[name] || DEFAULT_PIC;
}

export const initialPlaces = [
  {
    id: 1,
    name: 'Chợ Bến Thành',
    district: 'Phường Bến Thành',
    buses: [
      { no: '01', stop: 'Trạm Bến Thành' },
      { no: '03', stop: 'Trạm Lê Lai' },
    ],
    content:
      'Chợ Bến Thành là một trong những khu chợ nổi tiếng tại trung tâm Thành phố Hồ Chí Minh. Nơi đây tập trung nhiều mặt hàng và là điểm tham quan quen thuộc của du khách.',
    request: null,
    manager: '—',
  },
  {
    id: 2,
    name: 'Bến Bạch Đằng',
    district: 'Đường Tôn Đức Thắng',
    buses: [
      { no: '03', stop: 'Trạm Công trường Mê Linh' },
      { no: '19', stop: 'Trạm Bến Bạch Đằng' },
    ],
    content:
      'Bến Bạch Đằng nằm bên sông Sài Gòn, là không gian công cộng để ngắm cảnh ven sông và kết nối với các hoạt động du lịch đường thủy.',
    request: {
      manager: 'Nguyễn Minh Anh',
      date: '02/10/2026',
      content:
        'Bến Bạch Đằng là không gian ven sông Sài Gòn, có lối đi bộ thoáng đãng, tầm nhìn ra sông và các hoạt động tham quan bằng tàu. Du khách có thể dừng chân ngắm cảnh trung tâm thành phố.',
    },
  },
  {
    id: 3,
    name: 'Dinh Độc Lập',
    district: 'Đường Nam Kỳ Khởi Nghĩa',
    buses: [
      { no: '04', stop: 'Trạm Dinh Độc Lập' },
      { no: '30', stop: 'Trạm Pasteur' },
    ],
    content:
      'Dinh Độc Lập là công trình gắn với nhiều dấu mốc lịch sử Việt Nam, hiện là di tích lịch sử và địa điểm tham quan tại trung tâm thành phố.',
    request: null,
    manager: '—',
  },
  {
    id: 4,
    name: 'Nhà thờ Đức Bà',
    district: 'Công trường Công xã Paris',
    buses: [
      { no: '03', stop: 'Trạm Nhà thờ Đức Bà' },
      { no: '14', stop: 'Trạm Hai Bà Trưng' },
    ],
    content:
      'Nhà thờ Đức Bà Sài Gòn là công trình kiến trúc nổi bật tại trung tâm thành phố, nằm trong khu vực có nhiều công trình và điểm tham quan lịch sử.',
    request: {
      manager: 'Trần Gia Hân',
      date: '01/10/2026',
      content:
        'Nhà thờ Đức Bà là công trình kiến trúc tiêu biểu ở trung tâm Thành phố Hồ Chí Minh. Khu vực quanh nhà thờ có nhiều công trình di sản, hàng cây và quảng trường, thuận tiện để kết hợp tham quan.',
    },
  },
  {
    id: 5,
    name: 'Bưu điện Trung tâm Sài Gòn',
    district: 'Công trường Công xã Paris',
    buses: [
      { no: '03', stop: 'Trạm Bưu điện Thành phố' },
      { no: '36', stop: 'Trạm Lê Duẩn' },
    ],
    content:
      'Bưu điện Trung tâm Sài Gòn nổi bật với kiến trúc cổ điển, là công trình lâu đời vẫn phục vụ hoạt động bưu chính và đón khách tham quan.',
    request: null,
    manager: '—',
  },
  {
    id: 6,
    name: 'Đường sách Nguyễn Văn Bình',
    district: 'Đường Nguyễn Văn Bình',
    buses: [{ no: '06', stop: 'Trạm Nhà thờ Đức Bà' }],
    content:
      'Đường sách Nguyễn Văn Bình là không gian văn hóa đọc với nhiều gian hàng sách, hoạt động giao lưu và điểm dừng chân yên tĩnh giữa trung tâm thành phố.',
    request: null,
    manager: '—',
  },
  {
    id: 7,
    name: 'Nhà hát Thành phố',
    district: 'Đường Đồng Khởi',
    buses: [
      { no: '19', stop: 'Trạm Nhà hát Thành phố' },
      { no: '45', stop: 'Trạm Công trường Lam Sơn' },
    ],
    content:
      'Nhà hát Thành phố là công trình kiến trúc tiêu biểu, nơi tổ chức các chương trình biểu diễn nghệ thuật và là điểm tham quan ở khu vực trung tâm.',
    request: null,
    manager: '—',
  },
];

// Mỗi địa danh có một bộ nội dung đang hiển thị: ảnh bìa, tiêu đề, phụ đề,
// audio + văn bản tiếng Việt, audio + văn bản tiếng Anh, và bộ ảnh nổi bật.
const englishCurrent = {
  'Chợ Bến Thành':
    'Ben Thanh Market is one of the best-known markets in the heart of Ho Chi Minh City. It brings together local goods, souvenirs, food and everyday trading, making it a familiar stop for visitors exploring central Saigon.',
  'Bến Bạch Đằng':
    'Bach Dang Wharf is a public waterfront space along the Saigon River. Visitors can enjoy open views, take a walk by the river and connect with sightseeing activities and waterway tours.',
  'Dinh Độc Lập':
    'Independence Palace, also known as Reunification Palace, is closely associated with important milestones in modern Vietnamese history. Today, it is a historic site and a popular destination in the city centre.',
  'Nhà thờ Đức Bà':
    'Saigon Notre-Dame Cathedral Basilica is a prominent architectural landmark in the city centre. The surrounding area includes historic buildings, tree-lined streets and public spaces that visitors can explore on foot.',
  'Bưu điện Trung tâm Sài Gòn':
    "Saigon Central Post Office is known for its historic architecture. This long-standing building continues to serve postal activities while welcoming visitors interested in the city's heritage.",
  'Đường sách Nguyễn Văn Bình':
    'Nguyen Van Binh Book Street is a cultural space for book lovers in the city centre. Its book stalls, community events and shaded pedestrian walkway create a calm stop amid the busy city.',
  'Nhà hát Thành phố':
    'The Saigon Opera House is a distinctive architectural landmark and a venue for performing arts. It is also a popular sightseeing stop in the central area of Ho Chi Minh City.',
};
initialPlaces.forEach((p) => {
  const image = pic(p.name).replace('w=240', 'w=1200');
  const gallery = [
    pic(p.name).replace('w=240', 'w=650'),
    pic(p.name).replace('w=240', 'w=650'),
    pic(p.name).replace('w=240', 'w=650'),
  ];
  p.current = {
    heroTitle: p.name,
    heroSub: p.district + ', Quận 1, TP. Hồ Chí Minh',
    coords: '10.77° N, 106.69° E',
    address: p.district + ', Quận 1, TP. Hồ Chí Minh',
    bgImg: image,
    gallery,
    descVi: p.content,
    descEn: englishCurrent[p.name] || '',
    audioVi: p.name.toLowerCase().replaceAll(' ', '-') + '-vi-hien-tai.mp3',
    audioEn: p.name.toLowerCase().replaceAll(' ', '-') + '-en-current.mp3',
  };
  if (p.request) {
    const req = p.request;
    const englishProposed = {
      'Bến Bạch Đằng':
        'Bach Dang Wharf is a riverside destination along the Saigon River, with a spacious pedestrian promenade, open river views and sightseeing boats. Visitors can pause here to enjoy the waterfront and see the city centre from a different perspective.',
      'Nhà thờ Đức Bà':
        'Saigon Notre-Dame Cathedral Basilica is a signature architectural landmark in central Ho Chi Minh City. The surrounding heritage buildings, tree-lined streets and open square make this area a convenient place to combine several sightseeing stops.',
    };
    p.request = {
      manager: req.manager,
      date: req.date,
      heroTitle: p.name,
      heroSub: p.current.heroSub,
      coords: p.current.coords,
      address: p.current.address,
      bgImg: p.current.bgImg,
      gallery: [...p.current.gallery],
      descVi: req.content,
      descEn: englishProposed[p.name] || p.current.descEn,
      audioVi: p.name.toLowerCase().replaceAll(' ', '-') + '-vi-de-xuat-v2.mp3',
      audioEn: p.name.toLowerCase().replaceAll(' ', '-') + '-en-proposed-v2.mp3',
    };
  }
});

export const initialAccounts = [
  {
    id: 1,
    name: 'Quản trị viên hệ thống',
    username: 'admin',
    role: 'Admin',
    date: '12/08/2026',
    active: true,
    locked: true,
  },
  {
    id: 2,
    name: 'Ban quản lý Bến Bạch Đằng',
    username: 'manager.benbachdang',
    role: 'Manager',
    date: '14/08/2026',
    active: true,
    placeName: 'Bến Bạch Đằng',
  },
  {
    id: 3,
    name: 'Ban quản lý Nhà thờ Đức Bà',
    username: 'manager.nhathoducba',
    role: 'Manager',
    date: '17/08/2026',
    active: true,
    placeName: 'Nhà thờ Đức Bà',
  },
  {
    id: 4,
    name: 'Ban quản lý Dinh Độc Lập',
    username: 'manager.dinhdoclap',
    role: 'Manager',
    date: '21/08/2026',
    active: true,
    placeName: 'Dinh Độc Lập',
  },
  {
    id: 5,
    name: 'Ban quản lý Đường sách Nguyễn Văn Bình',
    username: 'manager.duongsach',
    role: 'Manager',
    date: '25/08/2026',
    active: false,
    placeName: 'Đường sách Nguyễn Văn Bình',
  },
];

export const initialActivities = [
  { icon: '↻', text: 'Manager gửi yêu cầu cập nhật nội dung Bến Bạch Đằng.', time: '02/10/2026 · 09:40' },
  { icon: '↻', text: 'Manager gửi yêu cầu cập nhật nội dung Nhà thờ Đức Bà.', time: '01/10/2026 · 16:15' },
  { icon: '♙', text: 'Tài khoản Manager “Lê Hoàng Nam” được tạo.', time: '21/08/2026 · 10:22' },
  { icon: '▤', text: 'Cập nhật trạm xuống tuyến xe buýt minh họa.', time: '20/08/2026 · 14:06' },
];
