import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

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
  const [latestVersion, setLatestVersion] = useState<string>('13.24.1'); // Default version
  
  // First, fetch the latest version from Riot
  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setLatestVersion(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch latest DDragon version for champions, using default', error);
      }
    };
    
    fetchLatestVersion();
  }, []);
  
  // Then use the version to build the champion icon URL
  useEffect(() => {
    // Reset states when championId changes
    setIsLoading(true);
    setHasError(false);
    
    if (!championId && !fallbackChampion) {
      setHasError(true);
      setIsLoading(false);
      return;
    }
    
    // Use the ID provided or fallback
    const champion = championId || fallbackChampion;
    
    // Create direct DDragon URL
    const championUrl = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion}.png`;
    setSrc(championUrl);
    
  }, [championId, fallbackChampion, latestVersion]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-card animate-pulse">
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
          
          // If the champion failed and it's not already the fallback,
          // try the fallback champion instead
          if (championId !== fallbackChampion) {
            setSrc(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${fallbackChampion}.png`);
          }
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-card text-text-secondary text-xs font-bold">
          {championId || '?'}
        </div>
      )}
    </div>
  );
} 