
import { useEffect, useRef, useState } from "react";
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
    // Vẫn đổi ngôn ngữ nếu localStorage không khả dụng.
  }
}

// W09: Đồng bộ trang chi tiết với URL /user/:placeId.
export function useGuideState(
  words,
  places,
  onPlaybackStarted,
  routePlaceId
) {
  const [lang, setLang] = useState(readSavedLanguage);
  const [welcomeLang, setWelcomeLang] = useState(readSavedLanguage);
  const [entered, setEntered] = useState(() => Boolean(routePlaceId));
  const [page, setPage] = useState(() =>
    routePlaceId ? "detail" : "home"
  );
  const [currentPlace, setCurrentPlace] = useState(0);
  const scrollRef = useRef(null);

  const routeIndex = routePlaceId
    ? places.findIndex(
        (place) => String(place.id) === String(routePlaceId)
      )
    : -1;

const [playingPlaceId, setPlayingPlaceId] = useState(null);
const playingPlaceIndex = places.findIndex((place) => place.id === playingPlaceId);
const viewedPlace = places[currentPlace];

const audio = useAudioPlayer("", () => {
  if (playingPlaceId != null) {
    onPlaybackStarted?.({ landmarkId: playingPlaceId, language: lang });
  }
});

const isPlayingPlace = playingPlaceId != null && viewedPlace?.id === playingPlaceId;
const detailAudio = isPlayingPlace
  ? audio
  : {
      ...audio,
      playing: false,
      elapsed: 0,
      duration: 0,
      progress: 0,
      loading: false,
      ended: false,
      error: "",
      toggle: () => {
        const src = viewedPlace?.audioFile?.[lang];
        if (!src) return;

        const landmarkId = viewedPlace.id;
        setPlayingPlaceId(landmarkId);
        void audio.playSource(src, () => {
          onPlaybackStarted?.({ landmarkId, language: lang });
        });
      },
    };

  const tr = (key, fallback = key) =>
    words[lang]?.[key] ?? words.vi?.[key] ?? fallback;

  const showPage = (next) => {
    setPage(next);
    scrollRef.current?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const setLanguage = (next) => {
    if (next !== "vi" && next !== "en") return;
    setLang(next);
    setWelcomeLang(next);
    saveLanguage(next);
    if (next !== lang) {
      audio.reset();
      setPlayingPlaceId(null);
}
  };

  const openDetail = (index) => {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= places.length
    ) return;

   

    setCurrentPlace(index);
    setEntered(true);
    showPage("detail");
  };

  const enterApp = () => {
    setLanguage(welcomeLang);
    setEntered(true);
    showPage("home");
  };

  // Mở trang chi tiết qua URL hoặc mã QR.
  useEffect(() => {
    if (!routePlaceId) return;
    if (routeIndex < 0) return;

    setEntered(true);
    setPage("detail");
    setCurrentPlace((previous) =>
      routeIndex === previous ? previous : routeIndex
    );
  }, [routePlaceId, routeIndex]);

  // Quay về danh sách khi URL là /user.
  useEffect(() => {
    if (!routePlaceId && entered) {
      setPage("home");
    }
  }, [routePlaceId, entered]);

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
    detailAudio,
    playingPlaceIndex,
    routeIndex,
  };
}
