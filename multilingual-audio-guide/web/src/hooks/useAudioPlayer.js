import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(src) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [error, setError] = useState(null);

  // Tạo lại đối tượng Audio mỗi khi src (link mp3 trên Supabase) thay đổi
  useEffect(() => {
    setPlaying(false);
    setElapsed(0);
    setDuration(0);
    setProgress(0);
    setError(false);
 

   const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = src;
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

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    // Dọn dẹp khi component unmount hoặc src thay đổi
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  // Phát / Tạm dừng
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  // Dừng và quay về đầu
  const reset = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setPlaying(false);
    setElapsed(0);
    setProgress(0);
  };

  // Tua đến một thời điểm cụ thể (tính bằng giây)
  const seek = (time) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setElapsed(time);
    if (audioRef.current.duration > 0) {
      setProgress((time / audioRef.current.duration) * 100);
    }
  };

  return {
    playing, // Trạng thái đang phát (true/false)
    elapsed, // Thời gian hiện tại (giây)
    duration, // Tổng thời lượng (giây)
    progress, // Phần trăm tiến độ (0-100)
    toggle,   // Hàm phát/tạm dừng
    reset,    // Hàm dừng và quay về đầu
    seek,     // Hàm tua đến thời điểm bất kỳ
  };
}