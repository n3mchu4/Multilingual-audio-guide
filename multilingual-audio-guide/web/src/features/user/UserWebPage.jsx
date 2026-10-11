import { useGuideState } from "../../hooks/useGuideState";
import {
  SpotList,
  QuickList,
  DetailContent,
  MiniAudioPlayer,
} from "../admin/components/GuideContent";
import DesktopMap from "../admin/components/DesktopMap";
import { places, words } from "../admin/data/desktopData";
import "./UserWebPage.css";

export default function UserWebPage() {
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
  } = useGuideState(words);
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
            <div className="mini-avatar">{"SG"}</div>
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
                  "homeSubtitle",
                  "Bảy điểm dừng chân, những câu chuyện làm nên thành phố.",
                )}
              </p>
            </div>
            <div className="count-pill">
              <strong>{"07"}</strong>{" "}
              <span>{tr("placesCount", "địa danh nổi bật")}</span>
            </div>
          </div>
          <div className="explore-layout">
            <aside className="map-column">
              <DesktopMap
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
                  "Bản mẫu giao diện phục vụ đồ án thuyết minh đa ngôn ngữ. Bản đồ, nội dung chỉ đường và trình phát âm thanh trong mẫu là minh họa; có thể kết nối dữ liệu và dịch vụ thật ở giai đoạn phát triển.",
                )}
              </p>
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
            "SAIGON GUIDE · UI PROTOTYPE · QUẬN 1, TP. HỒ CHÍ MINH · ẢNH: WIKIMEDIA COMMONS"
          }
        </div>
      </div>
    </div>
  );
}
