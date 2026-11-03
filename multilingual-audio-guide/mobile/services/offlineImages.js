import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const downloading = new Map();

// Xác định thư mục lưu ảnh riêng của ứng dụng.
function imageDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('Device storage unavailable');
  }

  return `${FileSystem.documentDirectory}guide-images/`;
}

// Tìm ảnh đã tải đúng URL nguồn; bỏ qua tệp mất hoặc dữ liệu hỏng.
export async function getDownloadedImage(sourceUrl) {
  if (!sourceUrl) return null;

  try {
    const key = `guide.image.v1:${sourceUrl}`;
    const raw = await AsyncStorage.getItem(key);

    if (!raw) return null;

    const record = JSON.parse(raw);

    if (
      record?.sourceUrl !== sourceUrl ||
      typeof record?.fileName !== 'string' ||
      !/^[a-z0-9-]+\.(jpg|jpeg|png|webp|gif|avif)$/.test(
        record.fileName
      )
    ) {
      return null;
    }

    const uri = imageDirectory() + record.fileName;
    const info = await FileSystem.getInfoAsync(uri);

    return info.exists && !info.isDirectory && info.size > 0
      ? uri
      : null;
  } catch {
    return null;
  }
}

// Tải và lưu ảnh; chỉ ghi nhận thành công sau khi kiểm tra tệp.
async function saveImage(sourceUrl) {
  const existing = await getDownloadedImage(sourceUrl);
  if (existing) return existing;

  const directory = imageDirectory();
  let fileUri = null;

  try {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });

    const extension =
      sourceUrl
        .split(/[?#]/)[0]
        .match(/\.(jpg|jpeg|png|webp|gif|avif)$/i)?.[1]
        ?.toLowerCase() || 'jpg';

    const suffix =
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    const fileName = `image-${suffix}.${extension}`;
    fileUri = directory + fileName;

    const result = await FileSystem.downloadAsync(
      sourceUrl,
      fileUri
    );

    if (result.status !== 200) {
      throw new Error('Image download failed');
    }

    const contentType = Object.entries(result.headers || {})
      .find(([name]) => name.toLowerCase() === 'content-type')
      ?.[1] || '';

    if (/text\/|application\/json/i.test(contentType)) {
      throw new Error('URL did not return an image');
    }

    const info = await FileSystem.getInfoAsync(fileUri);

    if (!info.exists || info.isDirectory || !(info.size > 0)) {
      throw new Error('Downloaded image is empty');
    }

    await AsyncStorage.setItem(
      `guide.image.v1:${sourceUrl}`,
      JSON.stringify({
        sourceUrl,
        fileName,
        downloadedAt: Date.now(),
      })
    );

    return fileUri;
  } catch (error) {
    if (fileUri) {
      await FileSystem.deleteAsync(fileUri, {
        idempotent: true,
      }).catch(() => {});
    }

    throw error;
  }
}

// Tránh tải trùng khi nhiều vị trí trên giao diện dùng cùng một ảnh.
export function downloadImage(sourceUrl) {
  if (
    typeof sourceUrl !== 'string' ||
    !/^https?:\/\/\S+$/i.test(sourceUrl)
  ) {
    return Promise.reject(new Error('Invalid image URL'));
  }

  if (downloading.has(sourceUrl)) {
    return downloading.get(sourceUrl);
  }

  const task = saveImage(sourceUrl).finally(() => {
    downloading.delete(sourceUrl);
  });

  downloading.set(sourceUrl, task);
  return task;
}