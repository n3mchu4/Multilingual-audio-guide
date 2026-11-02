import { useRef, useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";

const LANGUAGE_STORAGE_KEY = "saigon-audio-guide.language";

function readSavedLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved === "en" || saved === "vi" ? saved : "vi";
  } catch {
    return "vi";
  }
}

function saveLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Trang vẫn đổi ngôn ngữ khi trình duyệt chặn localStorage.
  }
}

// Local UI state; không sửa document/window để các trang có thể cùng tồn tại.
export function useGuideState(words, places, onPlaybackStarted) {
  const [lang, setLang] = useState(readSavedLanguage);
  const [welcomeLang, setWelcomeLang] = useState(readSavedLanguage);
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
    if (next !== "vi" && next !== "en") return;
    setLang(next);
    setWelcomeLang(next);
    saveLanguage(next);
    audio.reset();
  };
  const openDetail = (index) => {
    if (index !== currentPlace) audio.reset();
    setCurrentPlace(index);
    showPage("detail");
  };
  const enterApp = () => {
    setLanguage(welcomeLang);
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

