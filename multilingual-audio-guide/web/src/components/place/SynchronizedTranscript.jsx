import { useEffect, useMemo, useRef, useState } from 'react';
import { buildTranscriptTimeline, findActiveTranscriptCue } from '@shared/utils/transcriptTiming.js';
import './SynchronizedTranscript.css';

const formatTime = (seconds) => {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(Math.floor(safe % 60)).padStart(2, '0')}`;
};

// W08: use measured transcript_cues_vi/en when provided by the API.
// Never present an estimated timeline as exact audio alignment.
export default function SynchronizedTranscript({ text, cues, audio, lang = 'vi', tr }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef(null);
  const activeRef = useRef(null);
  const timeline = useMemo(
    () => buildTranscriptTimeline(text, cues, audio.duration),
    [text, cues, audio.duration],
  );
  const sentences = timeline.cues;
  const activeIndex = audio.ended ? -1 : findActiveTranscriptCue(sentences, audio.elapsed);

  useEffect(() => {
    if (!autoScroll || activeIndex < 0 || !listRef.current || !activeRef.current) return;
    // Scroll inside transcript, not the entire page while a visitor is reading.
    const list = listRef.current;
    const item = activeRef.current;
    const target = item.offsetTop - list.offsetTop - (list.clientHeight - item.clientHeight) / 2;
    if (list.scrollHeight > list.clientHeight) {
      list.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  }, [activeIndex, autoScroll]);

  const jumpTo = (start) => {
    if (!Number.isFinite(start) || !(audio.duration > 0)) return;
    audio.seek(start, true);
  };

  if (!sentences.length) {
    return (
      <p className="empty-transcript" style={{ whiteSpace: 'pre-line' }}>
        {text || (tr ? tr('noTranscript') : 'Chưa có nội dung văn bản.')}
      </p>
    );
  }

  return (
    <div className="sync-transcript">
      {timeline.estimated && (
        <p role="status">
          {lang === 'vi'
            ? 'Mốc thời gian đang được ước lượng. Cần dữ liệu mốc câu theo audio để đồng bộ chính xác.'
            : 'Sentence times are estimated. Measured audio timestamps are needed for exact alignment.'}
        </p>
      )}
      <div className="transcript-toolbar">
        <div className="transcript-status" aria-live="off">
          {audio.playing && activeIndex >= 0 ? (
            <span className="live-sentence-badge">
              <span className="pulse-dot" />
              {lang === 'vi'
                ? `Đang đọc câu ${activeIndex + 1}/${sentences.length}`
                : `Reading sentence ${activeIndex + 1}/${sentences.length}`}
            </span>
          ) : (
            <span className="hint-sentence-badge">
              {lang === 'vi'
                ? 'Chọn câu để nghe từ vị trí tương ứng'
                : 'Select a sentence to play from its timestamp'}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`auto-scroll-btn ${autoScroll ? 'active' : ''}`}
          onClick={() => setAutoScroll((value) => !value)}
          aria-pressed={autoScroll}
          title={lang === 'vi' ? 'Tự động cuộn theo câu đang đọc' : 'Auto-scroll with playback'}
        >
          {autoScroll
            ? (lang === 'vi' ? '✓ Tự cuộn: Bật' : '✓ Auto-scroll: On')
            : (lang === 'vi' ? 'Tự cuộn: Tắt' : 'Auto-scroll: Off')}
        </button>
      </div>
      <div className="sentences-list" ref={listRef}>
        {sentences.map((item, index) => {
          const isActive = index === activeIndex && (audio.playing || audio.elapsed > 0);
          return (
            <div
              key={`${index}-${item.start}`}
              ref={isActive ? activeRef : null}
              className={`sentence-item ${isActive ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => jumpTo(item.start)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  jumpTo(item.start);
                }
              }}
              title={lang === 'vi'
                ? `Phát từ ${formatTime(item.start)}`
                : `Play from ${formatTime(item.start)}`}
            >
              <div className="sentence-action">
                <span className="sentence-time">{formatTime(item.start)}</span>
                <span className="sentence-play-icon">{isActive && audio.playing ? '▶' : '▷'}</span>
              </div>
              <p className="sentence-text">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
