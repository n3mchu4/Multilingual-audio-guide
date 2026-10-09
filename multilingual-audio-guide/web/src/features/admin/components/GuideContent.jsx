import { useRef } from "react";
export const imgUrl = (url, width = 900) =>
  `${url}${url.includes("?") ? "&" : "?"}width=${width}`;
const time = (seconds) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export function SpotList({ places, lang, tr, openDetail, mobile = false }) {
  return places.map((place, index) => (
    <article
      key={place.name.en}
      className={`spot-card ${!mobile && index % 2 ? "reverse" : ""}`}
    >
      <div className="spot-photo">
        <img
          loading="lazy"
          src={imgUrl(place.image, mobile ? 400 : 850)}
          alt={place.name[lang]}
        />
      </div>
      <div className="spot-copy">
        <h2>{place.name[lang]}</h2>
        <div className="spot-meta">
          ⌖ {place.time} · {tr("walking")}
        </div>
        <p>{place.desc[lang]}</p>
        <button
          type="button"
          className="outline-btn"
          onClick={() => openDetail(index)}
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
      key={place.name.en}
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
        <img
          src={imgUrl(place.image, mobile ? 600 : 1400)}
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
          <span>◉ {place.time}</span>
        </div>
        <div className="audio-player">
          <button
            type="button"
            className="play-button"
            onClick={audio.toggle}
            aria-label={audio.playing ? tr("pause") : tr("listen")}
          >
            {audio.playing ? "Ⅱ" : "▶"}
          </button>
          <div className="audio-info">
            <strong>{place.name[lang]}</strong>
            <small>
              {audio.playing
                ? lang === "vi"
                  ? "Đang mô phỏng phát audio…"
                  : "Simulating playback…"
                : tr("audioDemo")}
            </small>
            <div className="audio-progress">
              <span style={{ width: `${audio.progress}%` }} />
            </div>
          </div>
          <div className="audio-time">
            {time(audio.elapsed)} / {time(audio.duration)}
          </div>
        </div>
        <p className="audio-note">
          {lang === "vi"
            ? "Trình phát minh họa, chưa có tệp âm thanh."
            : "Player demo; no audio file connected."}
        </p>
      </section>
      <section className="detail-section">
        <div className="section-head">
          <h2>{tr("transcriptTitle")}</h2>
        </div>
        <div className="transcript">
          {place.history[lang].split(". ").map((paragraph, index) => (
            <p key={index}>
              {paragraph.endsWith(".") ? paragraph : `${paragraph}.`}
            </p>
          ))}
        </div>
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
          {[place.image, ...place.gallery].map((url, index) => (
            <figure key={`${url}-${index}`} className="gallery-card">
              <img
                loading="lazy"
                src={imgUrl(url, mobile ? 300 : 650)}
                alt={`${place.name[lang]} ${index + 1}`}
              />
              {!mobile && <figcaption>{place.name[lang]}</figcaption>}
            </figure>
          ))}
        </div>
        {!mobile && <div className="gallery-hint">{tr("galleryHint")}</div>}
      </section>
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
      aria-label="Trình phát minh họa thu nhỏ"
    >
      <button
        className="mini-audio-play"
        type="button"
        onClick={audio.toggle}
        aria-label={audio.playing ? "Pause demo" : "Play demo"}
      >
        {audio.playing ? "Ⅱ" : "▶"}
      </button>
      <div className={mobile ? "mini-audio-details" : "mini-audio-info"}>
        <strong>{place.name[lang]}</strong>
        <small>
          {audio.playing
            ? lang === "vi"
              ? "Đang mô phỏng audio…"
              : "Simulating audio…"
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
