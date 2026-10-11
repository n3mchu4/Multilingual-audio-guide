import { useRef, useState } from "react";
import { useAudioPlayer } from "./useAudioPlayer";

// Local UI state; không sửa document/window để các trang có thể cùng tồn tại.
export function useGuideState(words, places) {
  const [lang, setLang] = useState("vi");
  const [welcomeLang, setWelcomeLang] = useState("vi");
  const [entered, setEntered] = useState(false);
  const [page, setPage] = useState("home");
  const [currentPlace, setCurrentPlace] = useState(0);
  const scrollRef = useRef(null);
  const currentPlaceData = places[currentPlace];
// Lấy tên file audio (ví dụ: "Cho-Ben-Thanh.mp3")
  const audioFileName = currentPlaceData?.audioFile || "";
// Tạo đường dẫn đầy đủ, tự động thêm (vi) hoặc (en) dựa vào ngôn ngữ
// Ví dụ: /audio/vi/(vi)Cho-Ben-Thanh.mp3
  // Đoạn code gây lỗi (tìm và xóa nó đi)
  const audioSrc = places[currentPlace]?.audioFile;
// Sau đó truyền vào hook:
  const audio = useAudioPlayer(places[currentPlace]?.audioFile?.[lang]);
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
