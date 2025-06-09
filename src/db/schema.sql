-- Create champion_stats table for caching
CREATE TABLE IF NOT EXISTS champion_stats (
    id SERIAL PRIMARY KEY,
    cache_key TEXT NOT NULL,
    rank TEXT NOT NULL,
    region TEXT NOT NULL,
    role TEXT NOT NULL,
    stats JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cache_key)
);

-- Create index for faster cache lookups
CREATE INDEX IF NOT EXISTS idx_champion_stats_cache_key ON champion_stats(cache_key);

-- Create index for timestamp-based cleanup
CREATE INDEX IF NOT EXISTS idx_champion_stats_updated_at ON champion_stats(updated_at); 