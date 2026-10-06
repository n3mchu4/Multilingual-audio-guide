import { useEffect, useState } from "react";

// Mô phỏng như HTML gốc, không phát âm thanh và không tải file audio.
export function useDemoAudio(duration = 200) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!playing || elapsed >= duration) return undefined;
    const timer = setInterval(
      () => setElapsed((value) => Math.min(value + 1, duration)),
      1000,
    );
    return () => clearInterval(timer);
  }, [playing, elapsed, duration]);
  const active = playing && elapsed < duration;
  const toggle = () => {
    if (elapsed >= duration) {
      setElapsed(0);
      setPlaying(true);
    } else setPlaying((value) => !value);
  };
  const reset = () => {
    setPlaying(false);
    setElapsed(0);
  };
  return {
    playing: active,
    elapsed,
    duration,
    progress: (elapsed / duration) * 100,
    toggle,
    reset,
  };
}
