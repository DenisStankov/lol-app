-- Drop existing tables if they exist
DROP TABLE IF EXISTS champion_stats_aggregated CASCADE;
DROP TABLE IF EXISTS champion_stats_history CASCADE;
DROP TABLE IF EXISTS champion_stats_updates CASCADE;

-- Recreate champion_stats_aggregated table with correct schema
CREATE TABLE champion_stats_aggregated (
    id BIGSERIAL PRIMARY KEY,
    champion_id TEXT NOT NULL,
    rank TEXT NOT NULL,
    region TEXT NOT NULL,
    total_games INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    pick_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    ban_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    primary_role TEXT NOT NULL,
    tier TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(champion_id, rank, region)
);

-- Recreate champion_stats_history table
CREATE TABLE champion_stats_history (
    id BIGSERIAL PRIMARY KEY,
    champion_id TEXT NOT NULL,
    rank TEXT NOT NULL,
    region TEXT NOT NULL,
    primary_role TEXT NOT NULL,
    win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    pick_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    ban_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_games INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Recreate champion_stats_updates table
CREATE TABLE champion_stats_updates (
    id BIGSERIAL PRIMARY KEY,
    rank TEXT NOT NULL,
    region TEXT NOT NULL,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(rank, region)
);

-- Create indexes for better query performance
CREATE INDEX idx_champion_stats_aggregated_lookup 
ON champion_stats_aggregated(champion_id, rank, region);

CREATE INDEX idx_champion_stats_history_lookup 
ON champion_stats_history(champion_id, rank, region);

CREATE INDEX idx_champion_stats_history_updated_at 
ON champion_stats_history(updated_at); 