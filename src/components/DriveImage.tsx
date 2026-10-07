import React, { useState } from 'react';
import { normalizeDriveImageUrl, getDriveThumbnailFallbackUrl, isGoogleDriveUrl } from '../utils/driveImageHelper';
import { ImageOff, Sparkles } from 'lucide-react';

interface DriveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackIconClassName?: string;
}

export const DriveImage: React.FC<DriveImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIconClassName = 'h-8 w-8 text-slate-600',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isDrive = isGoogleDriveUrl(src);
  const primaryUrl = normalizeDriveImageUrl(src);
  const fallbackUrl = getDriveThumbnailFallbackUrl(src);

  // Determine current image source
  const currentSrc = triedFallback ? fallbackUrl : primaryUrl;

  const handleError = () => {
    if (isDrive && !triedFallback && fallbackUrl !== primaryUrl) {
      // Try secondary Drive CDN URL
      setTriedFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (!src || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-900/80 text-slate-500 p-3 text-center border border-slate-800 ${className}`}>
        <ImageOff className={fallbackIconClassName} />
        <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{alt || 'Sin imagen'}</span>
        {isDrive && (
          <span className="text-[9px] text-amber-500/80 mt-0.5">
            Verifica que en Drive el archivo tenga permiso: "Cualquiera con el enlace"
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900 animate-pulse flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-amber-500/40 animate-spin" />
        </div>
      )}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
