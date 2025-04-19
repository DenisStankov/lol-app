import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ChampionIconProps {
  championId: string | undefined;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackChampion?: string;
}

export default function ChampionIcon({
  championId,
  alt = 'Champion Icon',
  width = 64,
  height = 64,
  className = '',
  fallbackChampion = 'Aatrox'
}: ChampionIconProps) {
  const [src, setSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    // Reset states when championId changes
    setIsLoading(true);
    setHasError(false);
    
    // Use the id provided or fallback
    const id = championId || fallbackChampion;
    
    // Set the API URL
    setSrc(`/api/championIcon?championId=${id}`);
  }, [championId, fallbackChampion]);

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
          // Try the fallback champion if the original one failed
          if (championId !== fallbackChampion) {
            setSrc(`/api/championIcon?championId=${fallbackChampion}`);
          }
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-400 text-xs font-bold">
          {championId || '?'}
        </div>
      )}
    </div>
  );
} 