import { useEffect, useId, useRef, useState } from 'react';
import { MEDIA_LIMITS, validateMediaFile } from '@shared/media.js';
import { uploadMedia } from '../services/mediaUpload';

export default function MediaUpload({ label, kind, disabled, onUploaded, onBusyChange }) {
  const id = useId();
  const controller = useRef(null);
  const mounted = useRef(true);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; controller.current?.abort(); };
  }, []);

  const start = async (selected) => {
    if (!selected || controller.current) return;
    setError('');
    setStatus('');
    setFile(selected);
    try { validateMediaFile(kind, selected.name, selected.size, selected.type); }
    catch (validationError) { setError(validationError.message); return; }
    const abortController = new AbortController();
    controller.current = abortController;
    setBusy(true);
    setProgress(0);
    onBusyChange(true);
    try {
      const result = await uploadMedia(selected, kind, (value) => {
        if (mounted.current) setProgress(value);
      }, abortController.signal);
      if (!mounted.current) return;
      onUploaded(result.url);
      setProgress(100);
      setStatus(`Đã tải lên: ${selected.name}. Gửi đề xuất để Admin duyệt.`);
      setFile(null);
    } catch (uploadError) {
      if (mounted.current) setError(uploadError.message);
    } finally {
      controller.current = null;
      if (mounted.current) { setBusy(false); onBusyChange(false); }
    }
  };

  return (
    <div className="media-upload">
      <label htmlFor={id}>{label}</label>
      <small id={`${id}-help`}>
        {kind === 'image' ? 'JPG, PNG, WebP' : 'MP3, M4A, OGG, WAV'} · tối đa {MEDIA_LIMITS[kind] / 1024 / 1024} MiB/tệp
      </small>
      <input id={id} type="file" aria-describedby={`${id}-help`} disabled={disabled || busy}
        accept={kind === 'image' ? '.jpg,.jpeg,.png,.webp' : '.mp3,.m4a,.ogg,.wav'}
        onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ''; void start(selected); }} />
      {busy && <>
        <progress value={progress} max="100" aria-label={`Tiến trình ${label}`} />
        <span role="status">{progress < 99 ? `Đang gửi tệp: ${progress}%` : 'Đang lưu tệp vào Storage...'}</span>
        <button type="button" className="manager-button secondary" onClick={() => controller.current?.abort()}>Hủy upload</button>
      </>}
      {error && <>
        <span className="media-error" role="alert">{error}</span>
        {file && <button type="button" className="manager-button secondary" disabled={disabled || busy} onClick={() => void start(file)}>Thử lại</button>}
      </>}
      {status && <span role="status">{status}</span>}
    </div>
  );
}
