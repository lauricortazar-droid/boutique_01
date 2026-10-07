/**
 * Google Drive Image Helper
 * Converts any Google Drive sharing link (file/d/.../view, open?id=..., etc.)
 * into a direct embeddable image URL for <img> tags.
 */

export const extractDriveFileId = (rawUrl: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID
  const idQueryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch && idQueryMatch[1] && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    return idQueryMatch[1];
  }

  // Pattern 3: https://lh3.googleusercontent.com/d/FILE_ID
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  // Pattern 4: https://drive.google.com/thumbnail?id=FILE_ID
  const thumbnailMatch = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/i);
  if (thumbnailMatch && thumbnailMatch[1]) {
    return thumbnailMatch[1];
  }

  return null;
};

export const isGoogleDriveUrl = (rawUrl: string): boolean => {
  if (!rawUrl) return false;
  return !!extractDriveFileId(rawUrl);
};

/**
 * Transforms any Google Drive URL into a direct image URL with high resolution.
 * If not a Drive URL, returns the original URL.
 */
export const normalizeDriveImageUrl = (rawUrl?: string | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // sz=w1600 provides high resolution crisp thumbnail directly served by Google's CDN
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  }

  return trimmed;
};

/**
 * Alternative fallback using Google User Content CDN
 */
export const getDriveDirectCdnUrl = (rawUrl: string): string => {
  const fileId = extractDriveFileId(rawUrl);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
  }
  return rawUrl;
};
