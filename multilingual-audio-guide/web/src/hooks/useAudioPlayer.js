import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset playback state whenever the selected storage URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setProgress(0);
    setError('');

    const audio = new Audio();
    if (src) audio.src = src;
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
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
      setElapsed(0);
      setProgress(0);
    };
    const onError = () => setError('Không thể tải hoặc phát URL audio đã cấu hình.');

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Dọn dẹp khi component unmount hoặc src thay đổi
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      setError('');
      audioRef.current.play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          setError('Không thể tải hoặc phát URL audio đã cấu hình.');
        });
    }
  };

  const reset = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
    setElapsed(0);
    setProgress(0);
    setError('');
  };

  const seek = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setElapsed(time);
    if (audioRef.current.duration > 0) {
      setProgress((time / audioRef.current.duration) * 100);
    }
  };

  return {
    playing,
    elapsed,
    duration,
    progress,
    error,
    toggle,
    reset,
    seek,
  };
}