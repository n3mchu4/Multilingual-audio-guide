import { useRef, useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";

// Local UI state; không sửa document/window để các trang có thể cùng tồn tại.
export function useGuideState(words, places, onPlaybackStarted) {
  const [lang, setLang] = useState("vi");
  const [welcomeLang, setWelcomeLang] = useState("vi");
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("home");
  const [currentPlace, setCurrentPlace] = useState(0);
  const scrollRef = useRef(null);
   // audioFile là object { vi: "https://...supabase.co/.../vi.mp3", en: "..." }
  // Chỉ phát audio của đúng ngôn ngữ đang chọn.
  const audioFile = places[currentPlace]?.audioFile;
  const audioSrc = audioFile?.[lang] || "";
  const audio = useAudioPlayer(audioSrc, () => onPlaybackStarted?.({
    landmarkId: places[currentPlace]?.id,
    language: lang,
  }));
  const tr = (key, fallback = key) =>
    words[lang]?.[key] ?? words.vi?.[key] ?? fallback;
  const showPage = (next) => {
    setPage(next);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setLanguage = (next) => {
    setLang(next);
    audio.reset();
  };
  const openDetail = (index) => {
    if (index !== currentPlace) audio.reset();
    setCurrentPlace(index);
    showPage("detail");
  };
  const enterApp = () => {
    setLang(welcomeLang);
    setEntered(true);
    showPage("home");
  };
  return {
    lang,
    welcomeLang,
    chooseWelcomeLanguage: setWelcomeLang,
    entered,
    page,
    currentPlace,
    scrollRef,
    tr,
    showPage,
    setLanguage,
    openDetail,
    enterApp,
    audio,
  };
}
