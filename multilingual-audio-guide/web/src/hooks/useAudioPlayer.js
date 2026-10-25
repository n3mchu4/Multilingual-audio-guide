import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src, onPlay) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const onPlayRef = useRef(onPlay);
  useEffect(() => { onPlayRef.current = onPlay; }, [onPlay]);
  const [error, setError] = useState('');
  const [source, setSource] = useState(src);

  useEffect(() => {
    // Reset playback state whenever the selected storage URL changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setProgress(0);
    setError('');
    setSource(src);

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
    const onPause = () => setPlaying(false);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Dọn dẹp khi component unmount hoặc src thay đổi
    return () => {
      audioRef.current = null;
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [src]);

  const play = () => {
    if (!src || !audioRef.current) return Promise.resolve();
    setError('');
    const audio = audioRef.current;
    return audio.play()
      .then(() => {
        if (audioRef.current !== audio) return;
        setPlaying(true);
        onPlayRef.current?.();
      })
      .catch(() => {
        if (audioRef.current !== audio) return;
        setPlaying(false);
        setError('Không thể tải hoặc phát URL audio đã cấu hình.');
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
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
    setElapsed(0);
    setProgress(0);
    setError('');
  };

  const seek = (time, autoPlay = true) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setElapsed(time);
    if (audioRef.current.duration > 0) {
      setProgress((time / audioRef.current.duration) * 100);
    }
    if (autoPlay && !playing) {
      play();
    }
  };

  const matchesSource = source === src;
  return {
    playing: matchesSource && playing,
    elapsed: matchesSource ? elapsed : 0,
    duration: matchesSource ? duration : 0,
    progress: matchesSource ? progress : 0,
    error: matchesSource ? error : '',
    play,
    pause,
    toggle,
    reset,
    seek,
  };
}