// M01 + M10: gọi API có timeout, tự thử lại, thông báo lỗi dễ hiểu.
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_GUIDE_API_URL || "http://localhost:3002"
).replace(/\/$/, "");

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(message, { kind = "unknown", status = 0 } = {}) {
    super(message);
    this.name = "ApiError";
    this.kind = kind; // "timeout" | "network" | "http"
    this.status = status;
  }
}

export const errorMessage = (error, lang = "vi") => {
  const vi = lang === "vi";
  if (error?.kind === "timeout")
    return vi ? "Kết nối quá lâu. Vui lòng thử lại." : "Connection timed out. Please try again.";
  if (error?.kind === "network")
    return vi
      ? "Không kết nối được máy chủ. Kiểm tra mạng và thử lại."
      : "Cannot reach the server. Check your network and try again.";
  if (error?.kind === "http" && error.status >= 500)
    return vi ? "Máy chủ đang gặp sự cố. Thử lại sau." : "Server error. Please try later.";
  return vi ? "Đã có lỗi xảy ra. Vui lòng thử lại." : "Something went wrong. Please try again.";
};

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout ?? TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    if (!response.ok)
      throw new ApiError(`HTTP ${response.status}`, { kind: "http", status: response.status });
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error?.name === "AbortError") throw new ApiError("Timeout", { kind: "timeout" });
    throw new ApiError(error?.message || "Network error", { kind: "network" });
  } finally {
    clearTimeout(timer);
  }
}

// GET tự thử lại 2 lần (chỉ khi lỗi mạng/timeout/5xx).
export async function apiGet(path, { retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await request(path);
    } catch (error) {
      lastError = error;
      const retryable = error.kind !== "http" || error.status >= 500;
      if (!retryable || attempt === retries) break;
      await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
    }
  }
  throw lastError;
}

export const apiPost = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body), timeout: 6000 });