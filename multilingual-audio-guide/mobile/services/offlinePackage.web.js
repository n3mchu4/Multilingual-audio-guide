import { savePlaces } from './offlinePlaces';

const MEDIA_CACHE = 'saigon-guide-media-v1';
const SHELL_CACHE = 'saigon-guide-shell-v1';
const objectUrls = new Map();

function packageKey(lang) {
  return new URL('/__offline-package__/' + lang, location.origin).href;
}

async function saveAppShell() {
  await navigator.serviceWorker.register('/offline-worker.js');
  await navigator.serviceWorker.ready;

  const root = new URL('/', location.origin);
  const response = await fetch(root, { cache: 'no-cache' });
  if (!response.ok) throw new Error('App shell unavailable');

  const page = new DOMParser().parseFromString(
    await response.clone().text(),
    'text/html'
  );
  const assets = [
    ...page.querySelectorAll(
      'script[src], link[rel="stylesheet"][href], link[rel="modulepreload"][href]'
    ),
  ]
    .map((element) =>
      new URL(element.getAttribute('src') || element.getAttribute('href'), root)
    )
    .filter((url) => url.origin === root.origin);

  if (!assets.some((url) => url.pathname.startsWith('/_expo/static/js/'))) {
    throw new Error('Offline packages require an exported web build');
  }

  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(assets.map((url) => url.href));
  await cache.put(root.href, response);
}

export async function downloadOfflinePackage(places, lang, onProgress) {
  if (!['vi', 'en'].includes(lang) || !places.length || !navigator.serviceWorker) {
    throw new Error('Offline packages unavailable');
  }

  const sources = new Map();
  for (const place of places) {
    if (!place.audioUrl?.[lang]) {
      throw new Error('Missing audio for ' + place.id);
    }

    sources.set(place.audioUrl[lang], 'audio');
    for (const url of [place.image, ...place.gallery].filter(Boolean)) {
      sources.set(url, 'image');
    }
  }

  const cache = await caches.open(MEDIA_CACHE);
  let done = 0;
  onProgress(done, sources.size);

  for (const [url, type] of sources) {
    if (!(await cache.match(url))) {
      const response = await fetch(url);
      const mime = response.headers.get('content-type') || '';
      const file = await response.blob();

      if (
        response.status !== 200 ||
        !file.size ||
        !(mime.startsWith(type + '/') || mime === 'application/octet-stream')
      ) {
        throw new Error('Could not save ' + type);
      }

      await cache.put(
        url,
        new Response(file, { headers: { 'Content-Type': mime } })
      );
    }

    onProgress(++done, sources.size);
  }

  await saveAppShell();
  if (!(await savePlaces(places))) {
    throw new Error('Could not save landmark text');
  }

  await cache.put(packageKey(lang), Response.json([...sources.keys()]));
}

export async function hasOfflinePackage(lang) {
  try {
    const cache = await caches.open(MEDIA_CACHE);
    const manifest = await cache.match(packageKey(lang));
    if (!manifest) return false;

    const urls = await manifest.json();
    const keys = new Set((await cache.keys()).map((request) => request.url));

    return (
      urls.length > 0 &&
      urls.every((url) => keys.has(new URL(url, location.href).href))
    );
  } catch {
    return false;
  }
}

export async function getOfflineMedia(url) {
  if (!url) return null;

  try {
    if (!objectUrls.has(url)) {
      const response = await caches.match(url, { cacheName: MEDIA_CACHE });
      if (!response) return null;

      const file = await response.blob();
      if (!objectUrls.has(url)) {
        objectUrls.set(url, URL.createObjectURL(file));
      }
    }

    return objectUrls.get(url);
  } catch {
    return null;
  }
}