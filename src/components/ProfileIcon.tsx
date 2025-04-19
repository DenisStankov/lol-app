import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

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
  const [latestVersion, setLatestVersion] = useState<string>('13.24.1'); // Default version
  
  // First, fetch the latest version from Riot
  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setLatestVersion(response.data[0]);
        }
      } catch {
        // Failed to fetch latest DDragon version, using default
      }
    };
    
    fetchLatestVersion();
  }, []);
  
  // Then use the version to build the icon URL
  useEffect(() => {
    // Reset states when iconId changes
    setIsLoading(true);
    setHasError(false);
    
    if (!iconId && !fallbackIcon) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // Ensure iconId is a number (not a string "null" or "undefined")
    const numericIconId = iconId && typeof iconId !== 'undefined' && iconId !== 'null' && iconId !== 'undefined' 
      ? iconId 
      : fallbackIcon;
      
    // Create direct DDragon URL
    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${numericIconId}.png`;
    setSrc(iconUrl);
    
  }, [iconId, fallbackIcon, latestVersion]);

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
          
          // If the current icon failed and it's not already the fallback,
          // try the fallback icon instead
          if (iconId !== fallbackIcon) {
            setSrc(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${fallbackIcon}.png`);
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