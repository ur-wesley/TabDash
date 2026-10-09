/**
 * Downscales an image file to a small square data URL for use as a custom
 * shortcut icon. Keeps storage tiny (chrome.storage.local, and sync quota
 * when browser sync is on) while staying sharp on HiDPI tiles.
 */
export const fileToIconDataUrl = async (file: File, maxSize = 128): Promise<string> => {
  const bitmap = await createImageBitmap(file),
    scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height)),
    width = Math.max(1, Math.round(bitmap.width * scale)),
    height = Math.max(1, Math.round(bitmap.height * scale)),
    canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas 2D is not available');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/png');
};
