import { useEffect, useRef, useState } from "react";

const LOAD_ERROR_MESSAGE = "Không thể tải hoặc phát URL audio đã cấu hình.";

// W06/W07: trạng thái đầy đủ cho player (phát, tạm dừng, tua, đang tải, lỗi, kết thúc).
// onPlay chỉ được gọi MỘT lần cho mỗi phiên nghe (W11): tiếp tục phát sau khi tạm dừng
// hoặc tua không bắt đầu phiên mới; phiên mới bắt đầu khi audio kết thúc, bị reset,
// hoặc đổi nguồn (địa danh/ngôn ngữ khác).
export function useAudioPlayer(src, onPlay) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState(src);
  const audioRef = useRef(null);
  const sessionStartedRef = useRef(false);
  const onPlayRef = useRef(onPlay);
  useEffect(() => { onPlayRef.current = onPlay; }, [onPlay]);

  useEffect(() => {
    // Đặt lại toàn bộ trạng thái mỗi khi URL audio thay đổi để không phát chồng.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setProgress(0);
    setLoading(false);
    setEnded(false);
    setError("");
    setSource(src);
    sessionStartedRef.current = false;

    const audio = new Audio();
    audio.preload = "metadata";
    if (src) audio.src = src;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setElapsed(audio.currentTime);
      setProgress(0);
    };
    const onTimeUpdate = () => {
      setElapsed(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setLoading(false);
      setEnded(true);
      setElapsed(0);
      setProgress(0);
      sessionStartedRef.current = false;
    };
    const onWaiting = () => setLoading(true);
    const onReady = () => setLoading(false);
    const onPause = () => setPlaying(false);
    const onError = () => {
      setPlaying(false);
      setLoading(false);
      setError(LOAD_ERROR_MESSAGE);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onReady);
    audio.addEventListener("playing", onReady);

    // Dọn dẹp khi component unmount hoặc src thay đổi
    return () => {
      audioRef.current = null;
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onReady);
      audio.removeEventListener("playing", onReady);
    };
  }, [src]);

  const play = () => {
    if (!src || !audioRef.current) return Promise.resolve();
    setError("");
    const audio = audioRef.current;
    if (audio.ended) audio.currentTime = 0; // phát lại từ đầu sau khi kết thúc
    setEnded(false);
    if (audio.readyState < 3) setLoading(true);
    return audio.play()
      .then(() => {
        if (audioRef.current !== audio) return;
        setPlaying(true);
        if (!sessionStartedRef.current) {
          sessionStartedRef.current = true;
          onPlayRef.current?.();
        }
      })
      .catch(() => {
        if (audioRef.current !== audio) return;
        setPlaying(false);
        setLoading(false);
        setError(LOAD_ERROR_MESSAGE);
      });
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const reset = () => {
    sessionStartedRef.current = false;
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
    setLoading(false);
    setEnded(false);
    setElapsed(0);
    setProgress(0);
    setError("");
  };

  const seek = (time, autoPlay = true) => {
    if (!audioRef.current) return;
    const max = audioRef.current.duration > 0 ? audioRef.current.duration : Infinity;
    const target = Math.min(Math.max(0, time), max);
    audioRef.current.currentTime = target;
    setElapsed(target);
    setEnded(false);
    if (audioRef.current.duration > 0) {
      setProgress((target / audioRef.current.duration) * 100);
    }
    if (autoPlay && !playing) {
      play();
    }
  };

  // Tua theo tỉ lệ 0..1 (thanh tiến trình) — không tự phát nếu đang tạm dừng.
  const seekRatio = (ratio) => {
    const total = audioRef.current?.duration;
    if (!(total > 0)) return;
    seek(Math.min(1, Math.max(0, ratio)) * total, false);
  };

  // Tua tương đối (±giây), không tự phát.
  const skip = (delta) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime + delta, false);
  };

  // W13: thử tải lại audio khi lỗi.
  const retry = () => {
    if (!src || !audioRef.current) return Promise.resolve();
    setError("");
    setLoading(true);
    audioRef.current.load();
    return play();
  };

  const matchesSource = source === src;
  return {
    playing: matchesSource && playing,
    elapsed: matchesSource ? elapsed : 0,
    duration: matchesSource ? duration : 0,
    progress: matchesSource ? progress : 0,
    loading: matchesSource && loading,
    ended: matchesSource && ended,
    error: matchesSource ? error : "",
    play,
    pause,
    toggle,
    reset,
    seek,
    seekRatio,
    skip,
    retry,
  };
}
