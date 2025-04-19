import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProfileIconProps {
  iconId: number | string | undefined;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackIcon?: number;
}

export default function ProfileIcon({
  iconId,
  alt = 'Profile Icon',
  width = 64,
  height = 64,
  className = '',
  fallbackIcon = 29
}: ProfileIconProps) {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset states when iconId changes
    setIsLoading(true);
    setHasError(false);
    
    // Use the id provided or fallback
    const id = iconId || fallbackIcon;
    
    // Set the API URL
    setSrc(`/api/profileIcon?iconId=${id}`);
  }, [iconId, fallbackIcon]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 animate-pulse">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${hasError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        unoptimized
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          // Try the fallback icon if the original one failed
          if (iconId !== fallbackIcon) {
            setSrc(`/api/profileIcon?iconId=${fallbackIcon}`);
          }
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400 text-xs font-bold">
          {typeof iconId === 'string' || typeof iconId === 'number' ? iconId : '?'}
        </div>
      )}
    </div>
  );
} 