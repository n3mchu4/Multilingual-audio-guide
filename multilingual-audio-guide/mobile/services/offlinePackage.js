// The browser download is implemented in offlinePackage.web.js.
export const getOfflineMedia = async () => null;
export const hasOfflinePackage = async () => false;

export async function downloadOfflinePackage() {
  throw new Error('Browser offline packages unavailable');
}