import { useEffect, useMemo, useRef, useState } from 'react';
import { buildTranscriptTimeline, findActiveTranscriptCue } from '@shared/utils/transcriptTiming.js';
import './SynchronizedTranscript.css';
const time = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
export default function SynchronizedTranscript({ text, cues, audio, lang = "vi", tr }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const activeRef = useRef(null);

  const timeline = useMemo(() => buildTranscriptTimeline(text, cues, audio.duration), [text, cues, audio.duration]);
  const sentences = timeline.cues;
  const activeIndex = findActiveTranscriptCue(sentences, audio.elapsed);

  useEffect(() => {
    if (autoScroll && activeIndex >= 0 && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex, autoScroll]);

  const handleSentenceClick = (startTime) => {
    audio.seek(startTime, true);
  };

  if (!sentences.length) {
    return <p className="empty-transcript" style={{ whiteSpace: 'pre-line' }}>{text || (tr ? tr("noTranscript") : "Chưa có nội dung văn bản.")}</p>;
  }

  return (
    <div className="sync-transcript">
      {timeline.estimated && <p role="status">{lang === 'vi' ? 'Mốc câu ước lượng; chưa có mốc căn theo audio.' : 'Estimated sentence timing; audio alignment is not available yet.'}</p>}
      <div className="transcript-toolbar">
        <div className="transcript-status">
          {audio.playing && activeIndex >= 0 ? (
            <span className="live-sentence-badge">
              <span className="pulse-dot" />
              {lang === "vi"
                ? `Đang đọc câu ${activeIndex + 1}/${sentences.length}`
                : `Reading sentence ${activeIndex + 1}/${sentences.length}`}
            </span>
          ) : (
            <span className="hint-sentence-badge">
              💡 {lang === "vi" ? "Chạm vào câu bất kỳ để phát từ đoạn đó" : "Click any sentence to play from there"}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`auto-scroll-btn ${autoScroll ? "active" : ""}`}
          onClick={() => setAutoScroll((prev) => !prev)}
          title="Tự động cuộn theo câu đang đọc"
        >
          {autoScroll
            ? (lang === "vi" ? "✓ Tự cuộn: Bật" : "✓ Auto-scroll: On")
            : (lang === "vi" ? "Tự cuộn: Tắt" : "Auto-scroll: Off")}
        </button>
      </div>

      <div className="sentences-list">
        {sentences.map((item, index) => {
          const isActive = index === activeIndex && (audio.playing || audio.elapsed > 0);
          return (
            <div
              key={index}
              ref={isActive ? activeRef : null}
              className={`sentence-item ${isActive ? "active" : ""}`}
              onClick={() => handleSentenceClick(item.start)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSentenceClick(item.start);
                }
              }}
              title={lang === "vi" ? `Nhấn để phát từ ${time(item.start)}` : `Click to play from ${time(item.start)}`}
            >
              <div className="sentence-action">
                <span className="sentence-time">{time(item.start)}</span>
                <span className="sentence-play-icon">{isActive && audio.playing ? "▶" : "▷"}</span>
              </div>
              <p className="sentence-text">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

