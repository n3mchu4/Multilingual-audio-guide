import { useRef } from 'react';
import { useAdmin } from '../AdminContext';
import { pic } from '../data/mockData';

function Transcript({ text }) {
  const parts = String(text || '')
    .split(/\n\s*\n|(?<=\.)\s+(?=[A-ZÀ-Ỹ])/)
    .map((x) => x.trim())
    .filter(Boolean);
  return (
    <div className="visitor-transcript">
      {parts.length ? parts.map((x, i) => <p key={i}>{x}</p>) : <p>Chưa có nội dung thuyết minh.</p>}
    </div>
  );
}

function AudioSection({ label, title, audio }) {
  const { toast } = useAdmin();
  return (
    <section className="visitor-section">
      <div className="visitor-section-head">
        <h2>{label}</h2>
        <span>◉ 5–7 phút thuyết minh</span>
      </div>
      <div className="visitor-audio">
        <button
          className="visitor-play"
          type="button"
          onClick={() => toast('Bản xem trước: chưa kết nối tệp audio để phát trực tiếp.')}
        >
          ▶
        </button>
        <div className="visitor-audio-info">
          <strong>Nghe thuyết minh: {title}</strong>
          <small>{audio ? `Tệp audio: ${audio}` : 'Chưa có tệp audio được đính kèm'}</small>
          <div className="visitor-progress">
            <span></span>
          </div>
        </div>
        <div className="visitor-audio-time">00:00 / 03:20</div>
      </div>
      <p className="visitor-audio-note">
        Tệp audio được hiển thị theo đề xuất của Manager; bản HTML minh họa chưa phát âm thanh thật.
      </p>
    </section>
  );
}

/** Xem trước trang chi tiết địa danh đúng như khách tham quan sẽ thấy. */
export default function PlaceDetailPreview({ place, version }) {
  const galleryRef = useRef(null);
  const v = version || place.current || {};
  const cover = v.bgImg || pic(place.name).replace('w=240', 'w=1200');
  const gallery = v.gallery && v.gallery.length ? v.gallery : [pic(place.name).replace('w=240', 'w=650')];
  const title = v.heroTitle || place.name;
  const subtitle = v.heroSub || place.district || 'Quận 1, Thành phố Hồ Chí Minh';
  const scrollGallery = (dx) => galleryRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <div className="visitor-preview">
      <div className="visitor-hero" style={{ backgroundImage: `url('${String(cover).replace(/'/g, '%27')}')` }}>
        <div className="visitor-hero-copy">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="visitor-location-meta">
        <div>
          <small>TỌA ĐỘ VỊ TRÍ</small>
          <span>{v.coords || 'Chưa có thông tin'}</span>
        </div>
        <div>
          <small>ĐỊA CHỈ CHI TIẾT</small>
          <span>{v.address || place.district || 'Chưa có thông tin'}</span>
        </div>
      </div>

      <div className="language-version-label">TIẾNG VIỆT · BẢN NỘI DUNG RIÊNG CHO NGƯỜI DÙNG CHỌN TIẾNG VIỆT</div>
      <AudioSection label="Thuyết minh audio (Tiếng Việt)" title={title} audio={v.audioVi} />
      <section className="visitor-section">
        <div className="visitor-section-head">
          <h2>Nội dung thuyết minh</h2>
          <span>文 · Văn bản tiếng Việt</span>
        </div>
        <Transcript text={v.descVi} />
      </section>

      <div className="language-version-label english">ENGLISH · CONTENT FOR USERS WHO SELECT ENGLISH</div>
      <AudioSection label="Audio Guide (English)" title={title} audio={v.audioEn} />
      <section className="visitor-section">
        <div className="visitor-section-head">
          <h2>Narration Transcript</h2>
          <span>English text</span>
        </div>
        <Transcript text={v.descEn} />
      </section>

      <section className="visitor-section">
        <div className="visitor-section-head">
          <h2>Khoảnh khắc nổi bật</h2>
          <span>Bộ sưu tập địa danh</span>
        </div>
        <div className="visitor-gallery-arrows">
          <button type="button" aria-label="Ảnh trước" onClick={() => scrollGallery(-230)}>
            ‹
          </button>
          <button type="button" aria-label="Ảnh tiếp theo" onClick={() => scrollGallery(230)}>
            ›
          </button>
        </div>
        <div className="visitor-gallery" ref={galleryRef}>
          {gallery.map((url, i) => (
            <figure className="visitor-gallery-card" key={i}>
              <img
                src={String(url).replace('w=240', 'w=650').replace(/'/g, '%27')}
                alt={`${title} — ảnh ${i + 1}`}
                onError={(e) => (e.currentTarget.style.opacity = '.35')}
              />
              <figcaption>{title}</figcaption>
            </figure>
          ))}
        </div>
        <div className="visitor-gallery-hint">Lướt ngang để xem thêm ảnh →</div>
      </section>
    </div>
  );
}
