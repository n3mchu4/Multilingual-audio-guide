<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
=======
import { useCallback, useEffect, useRef, useState } from "react";
>>>>>>> e0187099c5f6da426fb69cf8bec1f52b3ebbbd0b
import { useGuideState } from "../../hooks/useGuideState";
import {
  SpotList,
  QuickList,
  DetailContent,
  MiniAudioPlayer,
} from "../admin/components/GuideContent";
import DesktopMap from "../admin/components/DesktopMap";
import { words } from "../admin/data/desktopData";
import "./UserWebPage.css";

const VISITOR_ID_KEY = "saigon-audio-guide.visitor-id";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createVisitorId() {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => {
      bytes[index] = Math.floor(Math.random() * 256);
    });
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function getVisitorId() {
  try {
    const existingId = window.localStorage.getItem(VISITOR_ID_KEY);
    if (existingId && UUID_PATTERN.test(existingId)) return existingId;
    const visitorId = createVisitorId();
    window.localStorage.setItem(VISITOR_ID_KEY, visitorId);
    return visitorId;
  } catch {
    return createVisitorId();
  }
}

function mapLandmark(landmark) {
  return {
    id: landmark.id,
    name: { vi: landmark.title_vi, en: landmark.title_en },
    audioFile: { vi: landmark.audio_vi_url, en: landmark.audio_en_url },
    short: { vi: landmark.subtitle_vi, en: landmark.subtitle_en },
    desc: { vi: landmark.description_vi, en: landmark.description_en },
    transcriptCues: {
      vi: landmark.transcript_cues_vi || [],
      en: landmark.transcript_cues_en || [],
    },
    history: {
      vi: landmark.transcript_vi || landmark.description_vi,
      en: landmark.transcript_en || landmark.description_en,
    },
    image: landmark.background_image_url || "",
    gallery: landmark.images || [],
    buses: landmark.buses || [],
    time: "5–7 phút",
  };
}

export default function UserWebPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const visitorIdRef = useRef("");

  useEffect(() => {
    const visitorId = getVisitorId();
    visitorIdRef.current = visitorId;
    void fetch("/api/analytics/visitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      })
      .catch((error) => {
        console.error("Could not record visitor analytics:", error);
      });
  }, []);

  const recordAudioListen = useCallback(({ landmarkId, language }) => {
    const visitorId = visitorIdRef.current;
    if (!visitorId || !landmarkId) return;

    void fetch("/api/analytics/listens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, landmarkId, language }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      })
      .catch((error) => {
        console.error("Could not record audio listen:", error);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadPlaces() {
      try {
        const response = await fetch("/api/landmarks?lang=vi", { signal: controller.signal });
        if (!response.ok) throw new Error("Không tải được địa danh từ PostgreSQL.");
        const result = await response.json();
        if (!Array.isArray(result.data)) throw new Error("API trả về danh sách địa danh không hợp lệ.");
        setPlaces(result.data.map(mapLandmark));
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error.message || "Không kết nối được PostgreSQL.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadPlaces();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let sessionId = '';
    try {
      sessionId = localStorage.getItem('saigon_guide_session') || '';
      if (!sessionId) {
        sessionId = `web-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem('saigon_guide_session', sessionId);
      }
    } catch {
      sessionId = `web-${Math.random().toString(36).slice(2, 10)}`;
    }
    const ping = () => {
      fetch('/api/analytics/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, platform: 'web', path: '/user' }),
      }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  const {
    lang,
    welcomeLang,
    chooseWelcomeLanguage,
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
  } = useGuideState(words, places, recordAudioListen);
  if (loading || loadError || places.length === 0) {
    return (
      <main className="sg-web" style={{ padding: 32 }}>
        <h1>Saigon Audio Guide</h1>
        <p role={loadError ? "alert" : "status"}>
          {loading ? "Đang tải địa danh từ PostgreSQL..." : loadError || "Chưa có địa danh trong cơ sở dữ liệu."}
        </p>
      </main>
    );
  }
  const contentProps = {
    places,
    lang,
    tr,
    currentPlace,
    openDetail,
    mobile: false,
  };
  return (
    <div className="sg-web" lang={lang} ref={scrollRef}>
      <section id="sg-web-welcome" className={entered ? "hidden" : ""}>
        <div className="welcome-shell">
          <div className="welcome-art">
            <div className="brand">
              <span className="brand-mark">{"S"}</span>
              {" SAIGON AUDIO GUIDE"}
            </div>
            <div className="art-caption">
              <div className="eyebrow">
                {tr("welcomeEyebrow", "YOUR CITY, YOUR STORY")}
              </div>
              <h2>{tr("welcomeTitle", "Chạm vào nhịp sống Sài Gòn")}</h2>
              <p>
                {tr(
                  "welcomeDesc",
                  "Khám phá những dấu ấn lịch sử và văn hóa của Quận 1 qua từng câu chuyện.",
                )}
              </p>
            </div>
          </div>
          <div className="welcome-panel">
            <div className="eyebrow">
              {tr("welcomeStep", "BẮT ĐẦU HÀNH TRÌNH")}
            </div>
            <h1>{tr("welcomeHello", "Chào mừng bạn")}</h1>
            <div className="script">{tr("welcomeScript", "welcome")}</div>
            <p className="sub">
              {tr(
                "welcomePrompt",
                "Chọn ngôn ngữ thuyết minh bạn muốn sử dụng.",
              )}
            </p>
            <button
              data-lang-choice="vi"
              onClick={() => chooseWelcomeLanguage("vi")}
              className={
                "language-option " + (welcomeLang === "vi" ? "selected" : "")
              }
              aria-pressed={welcomeLang === "vi"}
              type="button"
            >
              <span className="lang-code">{"VN"}</span>
              <span className="lang-name">
                {"Tiếng Việt"}
                <span className="lang-sub">
                  {"Thuyết minh bằng tiếng Việt"}
                </span>
              </span>
              <span className="radio-dot">
                {welcomeLang === "vi" ? "✓" : ""}
              </span>
            </button>
            <button
              data-lang-choice="en"
              onClick={() => chooseWelcomeLanguage("en")}
              className={
                "language-option " + (welcomeLang === "en" ? "selected" : "")
              }
              aria-pressed={welcomeLang === "en"}
              type="button"
            >
              <span className="lang-code">{"EN"}</span>
              <span className="lang-name">
                {"English"}
                <span className="lang-sub">{"Audio guide in English"}</span>
              </span>
              <span className="radio-dot">
                {welcomeLang === "en" ? "✓" : ""}
              </span>
            </button>
            <button
              className="primary-btn"
              onClick={() => enterApp()}
              type="button"
            >
              <span>{tr("continueBtn", "Tiếp tục")}</span>
              <span aria-hidden="true">{"→"}</span>
            </button>
            <div className="welcome-note">
              {tr(
                "welcomeNote",
                "Bạn có thể thay đổi ngôn ngữ bất cứ lúc nào trong Cài đặt.",
              )}
            </div>
          </div>
        </div>
      </section>
      <div id="sg-web-app" className={entered ? "" : "hidden"}>
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">{"S"}</span>
            {" SAIGON GUIDE"}
          </div>
          <nav className="nav">
            <button
              id="sg-web-homeTab"
              onClick={() => showPage("home")}
              className={"" + (page === "home" ? "active" : "")}
              type="button"
            >
              {tr("homeTab", "Trang chủ")}
            </button>
            <button
              id="sg-web-settingsTab"
              onClick={() => showPage("settings")}
              className={"" + (page === "settings" ? "active" : "")}
              type="button"
            >
              {tr("settingsTab", "Cài đặt")}
            </button>
          </nav>
          <div className="top-right">
            <button
              className="language-chip"
              onClick={() => showPage("settings")}
              id="sg-web-languageChip"
              type="button"
            >
              {lang === "vi" ? "◉ VI" : "◉ EN"}
            </button>
            <Link
              to="/login"
              className="mini-avatar"
              title="Đăng nhập Quản trị viên (Admin)"
              style={{ textDecoration: "none", cursor: "pointer" }}
            >
              {"⚙"}
            </Link>
          </div>
        </header>
        <main id="sg-web-homePage" className={page === "home" ? "" : "hidden"}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {tr("homeEyebrow", "THE CITY WALK · QUẬN 1")}
              </div>
              <h1>{tr("homeTitle", "Khám phá Sài Gòn")}</h1>
              <p>
                {tr(
                  "placesSubtitle",
                  lang === "vi"
                    ? `${places.length} địa danh được tải từ PostgreSQL.`
                    : `${places.length} landmarks loaded from PostgreSQL.`,
                )}
              </p>
            </div>
            <div className="count-pill">
              <strong>{String(places.length).padStart(2, "0")}</strong>{" "}
              <span>{tr("placesCount", "địa danh nổi bật")}</span>
            </div>
          </div>
          <div className="explore-layout">
            <aside className="map-column">
              <DesktopMap
                places={places}
                lang={lang}
                tr={tr}
                currentPlace={currentPlace}
                openDetail={openDetail}
              />
            </aside>
            <section
              className="spot-list"
              id="sg-web-spotList"
              aria-label="Danh sách địa danh"
            >
              <SpotList {...contentProps} />
            </section>
          </div>
        </main>
        <main
          id="sg-web-detailPage"
          className={page === "detail" ? "" : "hidden"}
        >
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {tr("detailEyebrow", "YOUR NEXT STOP")}
              </div>
              <h1>{tr("detailHeading", "Câu chuyện phía sau địa danh")}</h1>
              <p>
                {tr(
                  "detailSub",
                  "Nghe, đọc và khám phá theo nhịp riêng của bạn.",
                )}
              </p>
            </div>
          </div>
          <div className="detail-layout">
            <aside className="detail-side">
              <DesktopMap
                places={places}
                lang={lang}
                tr={tr}
                currentPlace={currentPlace}
                openDetail={openDetail}
                detail
              />
              <div className="quick-list">
                <QuickList {...contentProps} />
              </div>
            </aside>
            <section className="detail-main" id="sg-web-detailContent">
              <DetailContent
                {...contentProps}
                place={places[currentPlace]}
                audio={audio}
                showPage={showPage}
              />
            </section>
          </div>
        </main>
        <main
          id="sg-web-settingsPage"
          className={page === "settings" ? "" : "hidden"}
        >
          <div className="settings-wrap">
            <div className="eyebrow">
              {tr("settingsEyebrow", "PERSONALIZE YOUR EXPERIENCE")}
            </div>
            <h1
              style={{
                fontSize: "30px",
                letterSpacing: "-.04em",
                margin: "8px 0",
              }}
            >
              {tr("settingsTitle", "Cài đặt")}
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--muted)",
                lineHeight: "1.7",
              }}
            >
              {tr(
                "settingsIntro",
                "Tùy chỉnh trải nghiệm tham quan phù hợp với bạn.",
              )}
            </p>
            <div className="settings-card">
              <h2>
                {tr("languageSettings", "Ngôn ngữ hiển thị và thuyết minh")}
              </h2>
              <p>
                {tr(
                  "languageSettingsDesc",
                  "Chọn ngôn ngữ cho nội dung giao diện, văn bản và thuyết minh.",
                )}
              </p>
              <div className="setting-row">
                <span className="lang-code">{"VN"}</span>
                <span className="lang-name">
                  {"Tiếng Việt"}
                  <span className="lang-sub">{"Vietnamese"}</span>
                </span>
                <button
                  className="outline-btn"
                  onClick={() => setLanguage("vi")}
                  type="button"
                >
                  {tr("selectLanguage", "Sử dụng")}
                </button>
              </div>
              <div className="setting-row">
                <span className="lang-code">{"EN"}</span>
                <span className="lang-name">
                  {"English"}
                  <span className="lang-sub">{"English language"}</span>
                </span>
                <button
                  className="outline-btn"
                  onClick={() => setLanguage("en")}
                  type="button"
                >
                  {tr("selectLanguage", "Use English")}
                </button>
              </div>
            </div>
            <div className="settings-card">
              <h2>{tr("aboutSettings", "Về Saigon Guide")}</h2>
              <p>
                {tr(
                  "aboutDesc",
                  "Nội dung địa danh được tải từ PostgreSQL; ảnh và audio được phát từ các URL Storage đã lưu trong cơ sở dữ liệu. Bản đồ và lộ trình hiện vẫn là minh họa.",
                )}
              </p>
            </div>
            <div className="settings-card" style={{ borderLeft: "4px solid var(--accent)" }}>
              <h2>Quản trị hệ thống</h2>
              <p>Dành riêng cho Quản trị viên (Admin) và Ban quản lý địa danh (Manager) để theo dõi số người dùng, lượt nghe và duyệt nội dung thuyết minh.</p>
              <Link
                to="/login"
                className="outline-btn"
                style={{ textDecoration: "none", display: "inline-block", marginTop: 8 }}
              >
                Đăng nhập Quản trị viên →
              </Link>
            </div>
          </div>
        </main>
        <MiniAudioPlayer
          place={places[currentPlace]}
          lang={lang}
          audio={audio}
          showPage={showPage}
        />
        <div className="footer">
          {
            "SAIGON GUIDE · POSTGRESQL + STORAGE · QUẬN 1, TP. HỒ CHÍ MINH"
          }
        </div>
      </div>
    </div>
  );
}
