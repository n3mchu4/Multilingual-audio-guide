import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL } from './apiClient';

const busy = new Set();

// Xác định nơi lưu audio và khóa riêng cho địa danh/ngôn ngữ.
function audioConfig(landmarkId, lang) {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(landmarkId) ||
    !['vi', 'en'].includes(lang)
  ) {
    throw new Error('Invalid landmark or language');
  }

  if (!FileSystem.documentDirectory) {
    throw new Error('Device storage unavailable');
  }

  return {
    directory: `${FileSystem.documentDirectory}guide-audio/`,
    key: `guide.audio.v1:${API_BASE_URL}:${landmarkId}:${lang}`,
  };
}

// Đọc thông tin audio đã tải; chỉ nhận tên tệp trong thư mục của app.
async function readRecord(key) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;

  try {
    const record = JSON.parse(raw);

    if (
      typeof record?.sourceUrl !== 'string' ||
      typeof record?.fileName !== 'string' ||
      !/^[a-z0-9-]+\.(mp3|m4a|aac|ogg|wav|mp4)$/.test(
        record.fileName
      )
    ) {
      return null;
    }

    return record;
  } catch {
    return null;
  }
}

// Tìm audio đã tải đúng URL nguồn; trả null nếu tệp mất hoặc chưa tải.
export async function getDownloadedAudio(
  landmarkId,
  lang,
  sourceUrl
) {
  try {
    const { directory, key } = audioConfig(landmarkId, lang);
    const record = await readRecord(key);

    if (!record || record.sourceUrl !== sourceUrl) return null;

    const uri = directory + record.fileName;
    const info = await FileSystem.getInfoAsync(uri);

    return info.exists && !info.isDirectory && info.size > 0
      ? uri
      : null;
  } catch {
    return null;
  }
}

// Tải audio về máy; chỉ đánh dấu đã tải sau khi tệp được lưu thành công.
export async function downloadAudio(
  landmarkId,
  lang,
  sourceUrl
) {
  if (
    typeof sourceUrl !== 'string' ||
    !/^https?:\/\/\S+$/i.test(sourceUrl)
  ) {
    throw new Error('Invalid audio URL');
  }

  const { directory, key } = audioConfig(landmarkId, lang);

  if (busy.has(key)) {
    throw new Error('Audio operation in progress');
  }

  busy.add(key);
  let fileUri = null;

  try {
    const existing = await getDownloadedAudio(
      landmarkId,
      lang,
      sourceUrl
    );

    if (existing) return existing;

    const previous = await readRecord(key);

    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });

    const extension =
      sourceUrl
        .split(/[?#]/)[0]
        .match(/\.(mp3|m4a|aac|ogg|wav|mp4)$/i)?.[1]
        ?.toLowerCase() || 'mp3';

    const suffix =
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const fileName =
      `${landmarkId}-${lang}-${suffix}.${extension}`;

    fileUri = directory + fileName;

    const result = await FileSystem.downloadAsync(
      sourceUrl,
      fileUri
    );

    if (result.status !== 200) {
      throw new Error('Audio download failed');
    }

    const contentType = Object.entries(result.headers || {})
      .find(([name]) => name.toLowerCase() === 'content-type')
      ?.[1] || '';

    if (/text\/|application\/json/i.test(contentType)) {
      throw new Error('URL did not return an audio file');
    }

    const info = await FileSystem.getInfoAsync(fileUri);

    if (!info.exists || info.isDirectory || !(info.size > 0)) {
      throw new Error('Downloaded file is empty');
    }

    await AsyncStorage.setItem(
      key,
      JSON.stringify({
        sourceUrl,
        fileName,
        downloadedAt: Date.now(),
      })
    );

    if (previous && previous.fileName !== fileName) {
      await FileSystem.deleteAsync(
        directory + previous.fileName,
        { idempotent: true }
      ).catch(() => {});
    }

    return fileUri;
  } catch (error) {
    if (fileUri) {
      await FileSystem.deleteAsync(fileUri, {
        idempotent: true,
      }).catch(() => {});
    }

    throw error;
  } finally {
    busy.delete(key);
  }
}

// Xóa audio tải xuống của một địa danh theo ngôn ngữ.
export async function removeDownloadedAudio(
  landmarkId,
  lang
) {
  const { directory, key } = audioConfig(landmarkId, lang);

  if (busy.has(key)) {
    throw new Error('Audio operation in progress');
  }

  busy.add(key);

  try {
    const record = await readRecord(key);

    if (record) {
      await FileSystem.deleteAsync(
        directory + record.fileName,
        { idempotent: true }
      );
    }

    await AsyncStorage.removeItem(key);
  } finally {
    busy.delete(key);
  }
}