/**
 * Google Drive Image Helper
 * Converts any Google Drive sharing link into direct embeddable image URLs for <img> tags.
 * Works seamlessly with Google User Content CDN (lh3.googleusercontent.com)
 * and Google Drive Thumbnail CDN (drive.google.com/thumbnail).
 */

export const extractDriveFileId = (rawUrl?: string | null): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID or uc?id=FILE_ID or uc?export=view&id=FILE_ID
  const idQueryMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch && idQueryMatch[1] && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    return idQueryMatch[1];
  }

  // Pattern 3: https://lh3.googleusercontent.com/d/FILE_ID or /u/0/d/FILE_ID
  const lh3Match = url.match(/googleusercontent\.com\/(?:d|u\/\d+\/d)\/([a-zA-Z0-9_-]+)/i);
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

export const isGoogleDriveUrl = (rawUrl?: string | null): boolean => {
  if (!rawUrl) return false;
  return !!extractDriveFileId(rawUrl);
};

export const isGoogleDriveFolderUrl = (rawUrl?: string | null): boolean => {
  if (!rawUrl) return false;
  return rawUrl.includes('drive.google.com/drive/folders');
};

/**
 * Returns primary direct image URL for Google Drive file.
 * We use Google's lh3 usercontent CDN which supports direct image rendering in <img> tags.
 */
export const normalizeDriveImageUrl = (rawUrl?: string | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    // Primary: Google User Content direct embed
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
};

/**
 * Returns secondary fallback thumbnail URL in case primary fails
 */
export const getDriveThumbnailFallbackUrl = (rawUrl?: string | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const fileId = extractDriveFileId(rawUrl);
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }
  return rawUrl;
};

/**
 * Returns standard high-resolution CDN URL
 */
export const getDriveDirectCdnUrl = (rawUrl: string): string => {
  const fileId = extractDriveFileId(rawUrl);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=w1600`;
  }
  return rawUrl;
};
