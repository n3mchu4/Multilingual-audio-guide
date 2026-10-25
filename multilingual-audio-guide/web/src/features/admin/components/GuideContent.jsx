import { useCallback, useEffect, useRef, useState } from "react";
import SynchronizedTranscript from "../../../components/place/SynchronizedTranscript";
const imgUrl = (url) => url;

// Ảnh lỗi hoặc chưa có: hiện khung thay thế kèm tên địa danh thay vì ô trống.
function SafeImage({ src, alt, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  if (!src || failedSrc === src) {
    return (
      <div className="img-fallback" role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailedSrc(src)} {...rest} />;
}

// Thời gian nghe ước lượng từ độ dài transcript (không còn gán cứng).
// Giả định: tiếng Việt ~200 từ/phút (đo trên 6 file audio VI hiện có: 176–231),
// tiếng Anh ~150 từ/phút (chưa có audio EN để đo, dùng tốc độ đọc thông thường).
const WORDS_PER_MINUTE = { vi: 200, en: 150 };
function listenTime(place, lang) {
  const text = place.history?.[lang] || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return "";
  const minutes = Math.max(1, Math.round(words / (WORDS_PER_MINUTE[lang] || 150)));
  return lang === "vi" ? `≈ ${minutes} phút` : `≈ ${minutes} min`;
}
const time = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const totalSeconds = Math.floor(seconds); // Cắt bỏ phần thập phân
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Popup xem ảnh: chuyển ảnh bằng nút, phím ←/→, vuốt hoặc dải ảnh nhỏ; Esc/bấm nền để đóng.
function Lightbox({ images, index, alt, lang, onClose, onSelect }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const activeThumbRef = useRef(null);
  const touchStartX = useRef(null);
  const count = images.length;
  const vi = lang === "vi";

  const go = useCallback(
    (step) => onSelect((index + step + count) % count),
    [index, count, onSelect],
  );

  // Khóa cuộn trang phía sau, đưa focus vào popup và trả focus về ảnh đã bấm khi đóng.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && count > 1) {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight" && count > 1) {
        event.preventDefault();
        go(1);
      } else if (event.key === "Tab" && dialogRef.current) {
        // Giữ Tab quay vòng trong popup.
        const focusable = dialogRef.current.querySelectorAll("button:not([disabled])");
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [count, go, onClose]);

  // Cuộn dải ảnh nhỏ để ảnh đang xem luôn nằm trong khung nhìn.
  useEffect(() => {
    activeThumbRef.current?.scrollIntoView?.({ block: "nearest", inline: "center" });
  }, [index]);

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event) => {
    if (touchStartX.current == null || count < 2) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
  };

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="lightbox-top">
        <span className="lightbox-count" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          className="lightbox-close"
          ref={closeRef}
          onClick={onClose}
          aria-label={vi ? "Đóng" : "Close"}
        >
          ×
        </button>
      </div>
      <div
        className="lightbox-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {count > 1 && (
          <button
            type="button"
            className="lightbox-nav prev"
            onClick={() => go(-1)}
            aria-label={vi ? "Ảnh trước" : "Previous photo"}
          >
            ‹
          </button>
        )}
        <SafeImage
          className="lightbox-img"
          src={images[index]}
          alt={`${alt} ${index + 1}`}
          draggable={false}
        />
        {count > 1 && (
          <button
            type="button"
            className="lightbox-nav next"
            onClick={() => go(1)}
            aria-label={vi ? "Ảnh tiếp theo" : "Next photo"}
          >
            ›
          </button>
        )}
      </div>
      <p className="lightbox-caption">{alt}</p>
      {count > 1 && (
        <div className="lightbox-thumbs">
          {images.map((url, i) => (
            <button
              type="button"
              key={`${url}-${i}`}
              ref={i === index ? activeThumbRef : null}
              className={`lightbox-thumb ${i === index ? "active" : ""}`}
              onClick={() => onSelect(i)}
              aria-label={vi ? `Xem ảnh ${i + 1}` : `View photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              <img src={imgUrl(url)} alt="" loading="lazy" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SpotList({ places, lang, tr, openDetail, mobile = false }) {
  return places.map((place, index) => (
    <article
      key={place.id ?? place.name.en}
      className={`spot-card ${!mobile && index % 2 ? "reverse" : ""}`}
      role="link"
      tabIndex={0}
      aria-label={place.name[lang]}
      onClick={() => openDetail(index)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail(index);
        }
      }}
    >
      <div className="spot-photo">
        <SafeImage
          loading="lazy"
          src={place.image ? imgUrl(place.image) : ""}
          alt={place.name[lang]}
        />
      </div>
      <div className="spot-copy">
        <h2>{place.name[lang]}</h2>
        <div className="spot-meta">
          ⌖ {[listenTime(place, lang), tr("walking")].filter(Boolean).join(" · ")}
        </div>
        <p>{place.desc[lang]}</p>
        <button
          type="button"
          className="outline-btn"
          onClick={(event) => {
            event.stopPropagation();
            openDetail(index);
          }}
        >
          {tr("readMore")}
        </button>
      </div>
    </article>
  ));
}

export function QuickList({
  places,
  lang,
  currentPlace,
  openDetail,
  mobile = false,
}) {
  return places.map((place, index) => (
    <button
      type="button"
      key={place.id ?? place.name.en}
      className={`${mobile ? "chip-btn" : ""} ${index === currentPlace ? "active" : ""}`}
      onClick={() => openDetail(index)}
    >
      {!mobile && <span className="quick-num" />}
      {place.name[lang]}
    </button>
  ));
}

export function DetailContent({
  place,
  lang,
  tr,
  audio,
  showPage,
  mobile = false,
}) {
  const galleryRef = useRef(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);
  const audioUrl = place.audioFile?.[lang];
  // Bỏ ảnh trùng (ảnh bìa có thể cũng nằm trong thư viện ảnh).
  const galleryImages = [...new Set([place.image, ...place.gallery].filter(Boolean))];
  const lightboxOpen = lightboxIndex >= 0 && lightboxIndex < galleryImages.length;
  return (
    <>
      {!mobile && (
        <div className="detail-back-row">
          <button
            type="button"
            className="back-btn"
            onClick={() => showPage("home")}
          >
            ← {tr("backHome")}
          </button>
        </div>
      )}
      <div className="hero-detail">
        <SafeImage
          src={place.image ? imgUrl(place.image) : ""}
          alt={place.name[lang]}
        />
        <div className="hero-text">
          <h1>{place.name[lang]}</h1>
          <p>{place.short[lang]}</p>
        </div>
      </div>
      <section className="detail-section">
        <div className="section-head">
          <h2>{tr("audioTitle")}</h2>
          {listenTime(place, lang) && <span>◉ {listenTime(place, lang)}</span>}
        </div>
        <div className="audio-player">
          <button
            type="button"
            className="play-button"
            onClick={audio.toggle}
            disabled={!audioUrl}
            aria-label={audio.playing ? tr("pause") : tr("listen")}
          >
            {audio.playing ? "Ⅱ" : "▶"}
          </button>
          <div className="audio-info">
            <strong>{place.name[lang]}</strong>
            <small>
              {audio.playing
                ? lang === "vi"
                  ? "Đang phát audio…"
                  : "Playing audio…"
                : audioUrl
                  ? lang === "vi" ? "Sẵn sàng phát" : "Ready to play"
                  : lang === "vi" ? "Chưa có tệp audio" : "No audio file configured"}
            </small>
            <div className="audio-progress">
              <span style={{ width: `${audio.progress}%` }} />
            </div>
          </div>
          <div className="audio-time">
            {time(audio.elapsed)} / {time(audio.duration)}
          </div>
        </div>
        {(audio.error || !audioUrl) && (
          <p className="audio-note" role={audio.error ? "alert" : undefined}>
            {audio.error
              ? lang === "vi"
                ? "Không thể phát audio. Vui lòng thử lại sau."
                : "Unable to play the audio. Please try again later."
              : lang === "vi"
                ? "Địa danh này chưa có thuyết minh audio bằng tiếng Việt."
                : "This landmark does not have an English audio guide yet."}
          </p>
        )}
      </section>
      <section className="detail-section">
        <div className="section-head">
          <h2>{tr("transcriptTitle")}</h2>
          <span className="transcript-hint">◉ {tr("listen")} &amp; {tr("readMore")}</span>
        </div>
        <SynchronizedTranscript
          text={place.history?.[lang]}
          cues={place.transcriptCues?.[lang]}
          audio={audio}
          lang={lang}
          tr={tr}
        />
      </section>
      <section className="detail-section">
        <div className="section-head">
          <h2>{tr("galleryTitle")}</h2>
        </div>
        {!mobile && (
          <div className="gallery-arrows">
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={() =>
                galleryRef.current?.scrollBy({ left: -300, behavior: "smooth" })
              }
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Ảnh tiếp theo"
              onClick={() =>
                galleryRef.current?.scrollBy({ left: 300, behavior: "smooth" })
              }
            >
              ›
            </button>
          </div>
        )}
        <div className="gallery" ref={galleryRef}>
          {galleryImages.map((url, index) => (
            <figure
              key={`${url}-${index}`}
              className="gallery-card"
              role="button"
              tabIndex={0}
              aria-label={
                lang === "vi"
                  ? `Xem ảnh ${index + 1}/${galleryImages.length}`
                  : `View photo ${index + 1} of ${galleryImages.length}`
              }
              onClick={() => setLightboxIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setLightboxIndex(index);
                }
              }}
            >
              <SafeImage
                loading="lazy"
                src={imgUrl(url)}
                alt={`${place.name[lang]} ${index + 1}`}
              />
              {!mobile && <figcaption>{place.name[lang]}</figcaption>}
            </figure>
          ))}
        </div>
        {!mobile && <div className="gallery-hint">{tr("galleryHint")}</div>}
      </section>
      {place.buses?.length > 0 && (
        <section className="detail-section">
          <div className="section-head">
            <h2>{tr("busTitle")}</h2>
          </div>
          <ul className="bus-list">
            {place.buses.map((bus, index) => (
              <li key={`${bus.no}-${bus.stop}-${index}`}>
                <span className="bus-no">
                  {lang === "vi" ? "Tuyến" : "Route"} {bus.no}
                </span>
                <span className="bus-stop">{bus.stop}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          index={lightboxIndex}
          alt={place.name[lang]}
          lang={lang}
          onClose={closeLightbox}
          onSelect={setLightboxIndex}
        />
      )}
    </>
  );
}

export function MiniAudioPlayer({
  place,
  lang,
  audio,
  showPage,
  mobile = false,
}) {
  return (
    <div
      className={`mini-audio-player ${audio.elapsed > 0 || audio.playing ? (mobile ? "" : "visible") : "hidden"}`}
      role="region"
      aria-label="Trình phát audio"
    >
      <button
        className="mini-audio-play"
        type="button"
        onClick={audio.toggle}
        aria-label={audio.playing ? "Pause audio" : "Play audio"}
      >
        {audio.playing ? "Ⅱ" : "▶"}
      </button>
      <div className={mobile ? "mini-audio-details" : "mini-audio-info"}>
        <strong>{place.name[lang]}</strong>
        <small>
          {audio.playing
            ? lang === "vi"
              ? "Đang phát audio…"
              : "Playing audio…"
            : lang === "vi"
              ? "Đã tạm dừng"
              : "Paused"}
        </small>
        {!mobile && (
          <div className="mini-audio-progress">
            <span style={{ width: `${audio.progress}%` }} />
          </div>
        )}
      </div>
      <button
        className="mini-audio-open"
        type="button"
        onClick={() => showPage("detail")}
      >
        {lang === "vi" ? "Mở audio ↗" : "Open audio ↗"}
      </button>
    </div>
  );
}