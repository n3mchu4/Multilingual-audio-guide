import { useAppStore } from '../store/useAppStore';
import { validateMediaFile } from '@shared/media.js';

export function uploadMedia(file, kind, onProgress, signal) {
  validateMediaFile(kind, file.name, file.size, file.type);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const token = useAppStore.getState().session?.token;
    if (!token) { reject(new Error('Phiên đăng nhập đã hết. Hãy đăng nhập lại.')); return; }
    const query = new URLSearchParams({ kind, filename: file.name });
    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL ?? ''}/api/manager/media?${query}`);
    xhr.timeout = 180000;
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    const abort = () => xhr.abort();
    signal?.addEventListener('abort', abort, { once: true });
    xhr.onloadend = () => signal?.removeEventListener('abort', abort);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100)));
    };
    xhr.onload = () => {
      let result;
      try { result = JSON.parse(xhr.responseText); } catch { /* Proxy may return HTML. */ }
      if (xhr.status >= 200 && xhr.status < 300 && result?.data?.url) resolve(result.data);
      else reject(new Error(typeof result?.error === 'string' ? result.error : 'Upload thất bại. Hãy thử lại.'));
    };
    xhr.onerror = () => reject(new Error('Mất kết nối. Kiểm tra mạng rồi thử lại.'));
    xhr.ontimeout = () => reject(new Error('Upload quá thời gian chờ. Hãy thử lại.'));
    xhr.onabort = () => reject(new Error('Đã hủy upload.'));
    if (signal?.aborted) { reject(new Error('Đã hủy upload.')); return; }
    xhr.send(file);
  });
}
