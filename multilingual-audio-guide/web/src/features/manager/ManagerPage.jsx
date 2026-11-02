import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { managerRequest } from "../../services/api";
import { useAppStore } from "../../store/useAppStore";
import "./styles/ManagerPortal.css";
import MediaUpload from "../../components/MediaUpload";

const EMPTY_FORM = {
  titleVi: "",
  titleEn: "",
  subtitleVi: "",
  subtitleEn: "",
  latitude: "",
  longitude: "",
  backgroundImageUrl: "",
  descriptionVi: "",
  descriptionEn: "",
  transcriptVi: "",
  transcriptEn: "",
  audioViUrl: "",
  audioEnUrl: "",
  gallery: "",
};

function toForm(landmark) {
  return {
    ...EMPTY_FORM,
    ...landmark,
    gallery: (landmark.gallery ?? []).join("\n"),
  };
}

function formatDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Icon({ name, ...props }) {
  const paths = {
    edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z",
    history: "M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2",
    pin: "M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0ZM12 7v6M9 10h6",
    music:
      "M9 18V5l12-2v13M9 8l12-2M9 18a3 3 0 1 1-3-3h3M21 16a3 3 0 1 1-3-3h3",
    image: "M3 3h18v18H3ZM3 16l5-5 4 4 4-5 5 6M8 7h.01",
    arrow: "M5 12h14M12 5l7 7-7 7",
    logout: "M9 4H4v16h5M10 12h11M17 8l4 4-4 4",
  };
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}

function Hero({ form, compact = false }) {
  return (
    <div className={`manager-hero${compact ? " compact" : ""}`}>
      {form.backgroundImageUrl && (
        <img src={form.backgroundImageUrl} alt={`Ảnh bìa ${form.titleVi}`} />
      )}
      <div className="manager-hero-text">
        <span className="manager-hero-kicker">SAIGON AUDIO GUIDE</span>
        <h1>{form.titleVi || "Địa danh của bạn"}</h1>
        <p>{form.subtitleVi || "Khám phá câu chuyện của Sài Gòn"}</p>
      </div>
      <span className="manager-draft-badge">Bản nháp nội dung</span>
    </div>
  );
}

function AudioPreview({ url, language }) {
  const [failedUrl, setFailedUrl] = useState(null);
  return (
    <div className="manager-audio-player">
      <span className="manager-audio-icon">
        <Icon name="music" />
      </span>
      <div className="manager-audio-content">
        <strong>
          {language === "vi" ? "Thuyết minh tiếng Việt" : "English narration"}
        </strong>
        {url ? (
          <audio
            key={url}
            controls
            preload="none"
            src={url}
            aria-label={`Nghe thử audio ${language.toUpperCase()}`}
            onError={() => setFailedUrl(url)}
          />
        ) : (
          <p>Chưa có tệp âm thanh. Tải lên hoặc nhập URL bên dưới.</p>
        )}
        {url && failedUrl === url && (
          <p role="alert">
            Không phát được audio. Hãy kiểm tra URL và định dạng tệp.
          </p>
        )}
      </div>
    </div>
  );
}

function DraftPreview({ form, onClose }) {
  const dialog = useRef(null);
  const [lang, setLang] = useState("vi");
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="manager-preview"
      aria-labelledby="manager-preview-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <div>
          <span>XEM TRƯỚC BẢN NHÁP</span>
          <h2 id="manager-preview-title">Góc nhìn khách tham quan</h2>
        </div>
        <button type="button" aria-label="Đóng xem trước" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="manager-preview-body">
        <Hero form={form} compact />
        <div
          className="manager-preview-languages"
          role="group"
          aria-label="Ngôn ngữ xem trước"
        >
          <button
            type="button"
            aria-pressed={lang === "vi"}
            onClick={() => setLang("vi")}
          >
            Tiếng Việt
          </button>
          <button
            type="button"
            aria-pressed={lang === "en"}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>
        <h3>{lang === "vi" ? form.titleVi : form.titleEn}</h3>
        <p>{lang === "vi" ? form.descriptionVi : form.descriptionEn}</p>
        <AudioPreview
          url={lang === "vi" ? form.audioViUrl : form.audioEnUrl}
          language={lang}
        />
        <h3>{lang === "vi" ? "Nội dung thuyết minh" : "Transcript"}</h3>
        <p className="manager-preview-transcript">
          {(lang === "vi" ? form.transcriptVi : form.transcriptEn) ||
            "Chưa có nội dung thuyết minh."}
        </p>
        <div className="manager-preview-gallery">
          {form.gallery
            .split(/\r?\n/)
            .filter((url) => url.trim())
            .map((url, index) => (
              <img
                key={`${index}-${url}`}
                src={url.trim()}
                alt={`Ảnh địa danh ${index + 1}`}
              />
            ))}
        </div>
      </div>
    </dialog>
  );
}

export default function ManagerPage() {
  const [tab, setTab] = useState("update");
  const [preview, setPreview] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [galleryTarget, setGalleryTarget] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const logout = useAppStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    managerRequest("/api/manager/workspace")
      .then(({ data }) => {
        if (cancelled) return;
        setWorkspace(data);
        setForm(toForm(data.current));
      })
      .catch((requestError) => {
        console.error(
          "Manager workspace request failed:",
          requestError.code,
          requestError.status,
        );
        if (!cancelled)
          setError(requestError.message || "Không tải được dữ liệu địa danh.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (uploading || saving || workspace?.pending) return;
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        gallery: form.gallery
          .split(/\r?\n/)
          .map((image) => image.trim())
          .filter(Boolean),
      };
      await managerRequest("/api/manager/proposals", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setMessage("Đề xuất đã được lưu vào PostgreSQL và đang chờ Admin duyệt.");
      try {
        const { data } = await managerRequest("/api/manager/workspace");
        setWorkspace(data);
        setForm(toForm(data.current));
      } catch (refreshError) {
        console.error(
          "Manager workspace refresh failed:",
          refreshError.code,
          refreshError.status,
        );
        setError(
          "Đề xuất đã được lưu, nhưng không thể tải lại lịch sử. Hãy tải lại trang để kiểm tra trạng thái.",
        );
      }
    } catch (requestError) {
      console.error(
        "Manager proposal submission failed:",
        requestError.code,
        requestError.status,
      );
      setError(requestError.message || "Không thể gửi đề xuất cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  const endSession = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleTabKey = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? "update"
        : event.key === "End"
          ? "history"
          : tab === "update"
            ? "history"
            : "update";
    setTab(next);
    document.getElementById(`manager-${next}-tab`)?.focus();
  };
  const locked = saving || uploading || Boolean(workspace?.pending);
  const gallery = form.gallery
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  const resetDraft = () => {
    if (locked) return;
    setForm(toForm(workspace.current));
    setGalleryTarget(null);
    setResetKey((value) => value + 1);
    setError("");
    setMessage("Đã đặt lại bản nháp theo nội dung đang công khai.");
  };
  const textField = (name, label, rows = 0) => (
    <label className="manager-field" key={name}>
      {label}
      {rows ? (
        <textarea
          name={name}
          value={form[name]}
          onChange={updateField}
          rows={rows}
          disabled={locked}
        />
      ) : (
        <input
          name={name}
          value={form[name]}
          onChange={updateField}
          disabled={locked}
          required={name.startsWith("title")}
          maxLength={name.startsWith("title") ? 200 : undefined}
        />
      )}
    </label>
  );
  const upload = (label, kind, field) => (
    <MediaUpload
      key={`${resetKey}-${field}`}
      label={label}
      kind={kind}
      disabled={locked}
      onBusyChange={setUploading}
      onUploaded={(url) => setForm((current) => ({ ...current, [field]: url }))}
    />
  );

  return (
    <main className="manager-portal">
      <div className="manager-shell">
        <header className="manager-header">
          <div className="manager-brand">
            <span className="manager-brand-mark">
              <Icon name="music" width="24" height="24" />
            </span>
            <div>
              <p className="manager-eyebrow">SAIGON AUDIO GUIDE</p>
              <h2>Cổng quản lý nội dung</h2>
            </div>
          </div>
          <div className="manager-account">
            <span className="manager-avatar">
              {workspace?.managerName?.slice(0, 1).toUpperCase() || "M"}
            </span>
            <div>
              <strong>{workspace?.managerName || "Manager"}</strong>
              <span>Ban quản lý địa danh</span>
            </div>
          </div>
        </header>
        <nav className="manager-nav" aria-label="Điều hướng Manager">
          <div role="tablist" aria-label="Nội dung Manager">
            <button
              type="button"
              role="tab"
              id="manager-update-tab"
              aria-selected={tab === "update"}
              tabIndex={tab === "update" ? 0 : -1}
              onKeyDown={handleTabKey}
              aria-controls="manager-update-panel"
              onClick={() => setTab("update")}
            >
              <Icon name="edit" />
              Cập nhật địa danh
            </button>
            <button
              type="button"
              role="tab"
              id="manager-history-tab"
              aria-selected={tab === "history"}
              tabIndex={tab === "history" ? 0 : -1}
              onKeyDown={handleTabKey}
              aria-controls="manager-history-panel"
              onClick={() => setTab("history")}
            >
              <Icon name="history" />
              Lịch sử đề xuất
              {workspace?.history.length > 0 && (
                <span className="manager-count">
                  {workspace.history.length}
                </span>
              )}
            </button>
          </div>
          <button type="button" className="manager-logout" onClick={endSession}>
            <Icon name="logout" />
            Đăng xuất
          </button>
        </nav>
        <div className="manager-body">
          {loading && (
            <div className="manager-empty" role="status">
              Đang tải dữ liệu địa danh...
            </div>
          )}
          {error && (
            <p className="manager-alert error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="manager-alert success" role="status">
              {message}
            </p>
          )}
          {workspace?.pending && (
            <p className="manager-alert warning" role="status">
              Đề xuất đang chờ Admin duyệt. Bạn có thể gửi bản cập nhật mới sau
              khi đề xuất được xử lý.
            </p>
          )}
          {workspace && (
            <>
              <section
                role="tabpanel"
                id="manager-update-panel"
                aria-labelledby="manager-update-tab"
                hidden={tab !== "update"}
              >
                <div className="manager-page-heading">
                  <div>
                    <p className="manager-eyebrow">KHÔNG GIAN LÀM VIỆC</p>
                    <h2>Cập nhật địa danh</h2>
                    <p>Chăm chút từng câu chuyện, mang Sài Gòn đến gần hơn.</p>
                  </div>
                  <span
                    className={`manager-status ${workspace.pending ? "pending" : ""}`}
                  >
                    <i />
                    {workspace.pending
                      ? "Đang chờ duyệt"
                      : "Sẵn sàng chỉnh sửa"}
                  </span>
                </div>
                <form onSubmit={submit} className="manager-form">
                  <section className="manager-cover-card">
                    <Hero form={form} />
                    <div className="manager-cover-tools">
                      {upload("Thay ảnh bìa", "image", "backgroundImageUrl")}
                      <details className="manager-url">
                        <summary>Hoặc nhập URL ảnh bìa</summary>
                        {textField("backgroundImageUrl", "Đường dẫn ảnh bìa")}
                      </details>
                    </div>
                  </section>
                  <div className="manager-location-card">
                    <span className="manager-location-icon">
                      <Icon name="pin" />
                    </span>
                    <div>
                      <span>ĐỊA DANH ĐƯỢC PHÂN CÔNG</span>
                      <strong>{workspace.landmarkName}</strong>
                    </div>
                    <div className="manager-coordinates">
                      <span>TỌA ĐỘ VỊ TRÍ</span>
                      <strong>
                        {form.latitude && form.longitude
                          ? `${form.latitude}, ${form.longitude}`
                          : "Chưa có tọa độ"}
                      </strong>
                    </div>
                  </div>
                  <details className="manager-section manager-info-editor">
                    <summary>
                      Thông tin chung & mô tả địa danh
                      <span>Tên, mô tả và vị trí</span>
                    </summary>
                    <div className="manager-fields">
                      {textField("titleVi", "Tên tiếng Việt")}
                      {textField("titleEn", "Tên tiếng Anh")}
                      {textField("subtitleVi", "Mô tả ngắn tiếng Việt", 2)}
                      {textField("subtitleEn", "Mô tả ngắn tiếng Anh", 2)}
                      <label className="manager-field">
                        Vĩ độ
                        <input
                          name="latitude"
                          type="number"
                          min="-90"
                          max="90"
                          step="any"
                          value={form.latitude}
                          onChange={updateField}
                          disabled={locked}
                        />
                      </label>
                      <label className="manager-field">
                        Kinh độ
                        <input
                          name="longitude"
                          type="number"
                          min="-180"
                          max="180"
                          step="any"
                          value={form.longitude}
                          onChange={updateField}
                          disabled={locked}
                        />
                      </label>
                      {textField(
                        "descriptionVi",
                        "Mô tả chi tiết tiếng Việt",
                        5,
                      )}
                      {textField(
                        "descriptionEn",
                        "Mô tả chi tiết tiếng Anh",
                        5,
                      )}
                    </div>
                  </details>
                  {["vi", "en"].map((language, index) => {
                    const suffix = language === "vi" ? "Vi" : "En";
                    return (
                      <section className="manager-section" key={language}>
                        <div className="manager-section-heading">
                          <div className="manager-section-title">
                            <span className="manager-language-badge">
                              {language.toUpperCase()}
                            </span>
                            <div>
                              <h2>
                                {language === "vi"
                                  ? "Thuyết minh tiếng Việt"
                                  : "Audio guide · English"}
                              </h2>
                              <p>
                                {language === "vi"
                                  ? "Âm thanh và nội dung dành cho khách Việt"
                                  : "Âm thanh và nội dung dành cho khách quốc tế"}
                              </p>
                            </div>
                          </div>
                          <span className="manager-section-number">
                            0{index + 1}
                          </span>
                        </div>
                        <AudioPreview
                          url={form[`audio${suffix}Url`]}
                          language={language}
                        />
                        {upload(
                          `Tải audio tiếng ${language === "vi" ? "Việt" : "Anh"}`,
                          "audio",
                          `audio${suffix}Url`,
                        )}
                        <details className="manager-url">
                          <summary>Hoặc nhập URL âm thanh</summary>
                          {textField(
                            `audio${suffix}Url`,
                            `Đường dẫn âm thanh tiếng ${language === "vi" ? "Việt" : "Anh"}`,
                          )}
                        </details>
                        <div className="manager-transcript-heading">
                          <label htmlFor={`manager-transcript-${language}`}>
                            {language === "vi"
                              ? "Nội dung thuyết minh"
                              : "Transcript"}
                          </label>
                          <span>
                            {form[`transcript${suffix}`].length.toLocaleString(
                              "vi-VN",
                            )}{" "}
                            ký tự
                          </span>
                        </div>
                        <textarea
                          className="manager-transcript"
                          id={`manager-transcript-${language}`}
                          name={`transcript${suffix}`}
                          value={form[`transcript${suffix}`]}
                          onChange={updateField}
                          rows="7"
                          disabled={locked}
                          placeholder={
                            language === "vi"
                              ? "Viết câu chuyện của địa danh..."
                              : "Tell the story of this landmark..."
                          }
                        />
                      </section>
                    );
                  })}
                  <section className="manager-section">
                    <div className="manager-section-heading">
                      <div className="manager-section-title">
                        <span className="manager-language-badge">
                          <Icon name="image" />
                        </span>
                        <div>
                          <h2>Khoảnh khắc nổi bật</h2>
                          <p>Bộ sưu tập hình ảnh của địa danh</p>
                        </div>
                      </div>
                      <span className="manager-gallery-count">
                        {gallery.length}/20 ảnh
                      </span>
                    </div>
                    <div className="manager-gallery">
                      {gallery.map((url, index) => (
                        <div
                          className="manager-gallery-card"
                          key={`${index}-${url}`}
                        >
                          <img
                            src={url}
                            alt={`Ảnh thư viện ${index + 1}`}
                            loading="lazy"
                          />
                          <div>
                            <button
                              type="button"
                              disabled={locked}
                              onClick={() => setGalleryTarget(index)}
                              aria-pressed={galleryTarget === index}
                            >
                              Đổi ảnh {index + 1}
                            </button>
                            <button
                              type="button"
                              disabled={locked}
                              aria-label={`Xóa ảnh ${index + 1} khỏi bản nháp`}
                              onClick={() => {
                                setForm((current) => ({
                                  ...current,
                                  gallery: current.gallery
                                    .split(/\r?\n/)
                                    .map((image) => image.trim())
                                    .filter(Boolean)
                                    .filter((_, position) => position !== index)
                                    .join("\n"),
                                }));
                                setGalleryTarget(null);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {gallery.length === 0 && (
                      <p className="manager-gallery-empty">
                        Chưa có ảnh thư viện. Thêm những góc nhìn nổi bật đầu
                        tiên.
                      </p>
                    )}
                    <MediaUpload
                      key={`${resetKey}-gallery-${galleryTarget ?? "new"}`}
                      label={
                        galleryTarget == null
                          ? "Thêm ảnh thư viện"
                          : `Tải ảnh thay thế ảnh ${galleryTarget + 1}`
                      }
                      kind="image"
                      disabled={
                        locked ||
                        (galleryTarget == null && gallery.length >= 20)
                      }
                      onBusyChange={setUploading}
                      onUploaded={(url) => {
                        setForm((current) => {
                          const images = current.gallery
                            .split(/\r?\n/)
                            .map((image) => image.trim())
                            .filter(Boolean);
                          if (galleryTarget == null) images.push(url);
                          else images[galleryTarget] = url;
                          return { ...current, gallery: images.join("\n") };
                        });
                        setGalleryTarget(null);
                      }}
                    />
                    {galleryTarget != null && (
                      <button
                        type="button"
                        className="manager-text-button"
                        disabled={locked}
                        onClick={() => setGalleryTarget(null)}
                      >
                        Chuyển sang thêm ảnh mới
                      </button>
                    )}
                    <details className="manager-url">
                      <summary>Quản lý ảnh bằng URL</summary>
                      {textField(
                        "gallery",
                        "Ảnh thư viện (mỗi đường dẫn trên một dòng)",
                        4,
                      )}
                    </details>
                  </section>
                  <div className="manager-action-bar">
                    <p>
                      Nội dung chỉ công khai sau khi Admin duyệt.
                      <br />
                      <span>
                        Khi đổi lời thuyết minh, cần cung cấp cả hai bản audio.
                      </span>
                    </p>
                    <div>
                      <button
                        type="button"
                        className="manager-button secondary"
                        disabled={locked}
                        onClick={resetDraft}
                      >
                        Đặt lại như cũ
                      </button>
                      <button
                        type="button"
                        className="manager-button preview"
                        onClick={() => setPreview(true)}
                      >
                        Xem trước
                      </button>
                      <button
                        className="manager-button primary"
                        type="submit"
                        disabled={locked}
                      >
                        {saving ? "Đang gửi..." : "Gửi đề xuất"}
                        <Icon name="arrow" />
                      </button>
                    </div>
                  </div>
                </form>
              </section>
              <section
                role="tabpanel"
                id="manager-history-panel"
                aria-labelledby="manager-history-tab"
                hidden={tab !== "history"}
              >
                <div className="manager-page-heading">
                  <div>
                    <p className="manager-eyebrow">THEO DÕI CẬP NHẬT</p>
                    <h2>Lịch sử đề xuất</h2>
                    <p>Các đề xuất gần đây và phản hồi từ Admin.</p>
                  </div>
                </div>
                {workspace.history.length === 0 ? (
                  <div className="manager-empty">
                    <Icon name="history" width="36" height="36" />
                    <h3>Chưa có đề xuất nào</h3>
                    <p>Những cập nhật bạn gửi sẽ xuất hiện tại đây.</p>
                    <button
                      className="manager-button preview"
                      onClick={() => setTab("update")}
                    >
                      Cập nhật địa danh
                    </button>
                  </div>
                ) : (
                  <div className="manager-history-wrap">
                    <table className="manager-history-table">
                      <thead>
                        <tr>
                          <th>Mã đề xuất</th>
                          <th>Thời gian gửi</th>
                          <th>Phản hồi từ Admin</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workspace.history.map((proposal) => (
                          <tr key={proposal.id}>
                            <td title={proposal.id}>
                              #{proposal.id.slice(0, 8)}
                            </td>
                            <td>
                              <time dateTime={proposal.submittedAt}>
                                {formatDate(proposal.submittedAt)}
                              </time>
                            </td>
                            <td>{proposal.reviewNote || "Chưa có phản hồi"}</td>
                            <td>
                              <span
                                className={`manager-history-status ${proposal.status.toLowerCase()}`}
                              >
                                {proposal.status === "PENDING"
                                  ? "Đang chờ duyệt"
                                  : proposal.status === "ACCEPTED"
                                    ? "Đã duyệt"
                                    : "Đã từ chối"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
        <footer className="manager-footer">
          <span>SAIGON AUDIO GUIDE</span>
          <span>Mỗi địa danh, một câu chuyện.</span>
        </footer>
      </div>
      {preview && (
        <DraftPreview form={form} onClose={() => setPreview(false)} />
      )}
    </main>
  );
}
