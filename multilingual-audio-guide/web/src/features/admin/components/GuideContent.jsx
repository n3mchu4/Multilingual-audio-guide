import { useRef } from "react";
import SynchronizedTranscript from "../../../components/place/SynchronizedTranscript";
const imgUrl = (url) => url;
const time = (seconds) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const totalSeconds = Math.floor(seconds); // Cắt bỏ phần thập phân
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function SpotList({ places, lang, tr, openDetail, mobile = false }) {
  return places.map((place, index) => (
    <article
      key={place.name.en}
      className={`spot-card ${!mobile && index % 2 ? "reverse" : ""}`}
    >
      <div className="spot-photo">
        <img
          loading="lazy"
          src={place.image ? imgUrl(place.image) : undefined}
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
  const audioUrl = place.audioFile?.[lang];
  const galleryImages = [place.image, ...place.gallery].filter(Boolean);
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
          src={place.image ? imgUrl(place.image) : undefined}
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
                  ? tr("audioDemo")
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
        <p className="audio-note">
          {audio.error || (audioUrl
            ? audioUrl
            : lang === "vi" ? "Thêm URL audio vào audio_vi_url/audio_en_url trong PostgreSQL."
              : "Set audio_vi_url/audio_en_url in PostgreSQL.")}
        </p>
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
            <figure key={`${url}-${index}`} className="gallery-card">
              <img
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
