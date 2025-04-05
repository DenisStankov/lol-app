# LoLytics

A modern League of Legends application featuring champion tier lists, champion details, and summoner profiles.

## Features

- **Champion Tier List**: View the current meta and rankings for all champions in each role
- **Champion Details**: Detailed champion information including:
  - Abilities with full descriptions
  - Recommended item builds
  - Optimal rune setups
  - Hard counters and synergies
  - Skill order and max order
  - Win rates, pick rates, and ban rates
- **Summoner Profiles**: Look up summoner stats and match history

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Riot Games API key (for live data)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/lolytics.git
   cd lolytics
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up your Riot API key:
   - Create a `.env.local` file in the project root
   - Add your Riot API key:
     ```
     RIOT_API_KEY=RGAPI-your-actual-key
     ```
   - You can get a development API key from the [Riot Developer Portal](https://developer.riotgames.com/)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## API Key and Data Sources

### Riot API Key

This application uses the Riot Games API to fetch live data. If no valid API key is provided, the app will fall back to mock data.

**Note**: Development API keys from Riot expire every 24 hours. For production use, you should apply for a production API key.

### Data Sources

The application uses multiple data sources:

1. **Riot API**: Used for summoner data, match history, and league rankings.
2. **Data Dragon**: Used for champion images, ability descriptions, and item information.
3. **Match Analytics System**: For live data, the app analyzes high-ELO matches to determine:
   - Optimal item builds per champion/role
   - Current rune preferences
   - Common skill orders
   - Counter matchups
   - Synergies with other champions

When a valid API key is present, the app will attempt to fetch and analyze real match data. Without a key, mock data will be used.

## Development Notes

### Data Flow

1. Champion tier list data is fetched from `/api/champion-stats`
2. Champion details are fetched from `/api/champion-details?id=[champId]&role=[role]`
3. For real data, the app fetches match IDs from high-ELO players, then analyzes those matches

### Mock Data vs. Real Data

The application is designed to work without an API key by using mock data. When a valid API key is provided, it will progressively enhance the experience with real data:

1. Initially falls back to mock data
2. With API key, fetches real match data
3. Analyzes match data to generate personalized recommendations

## Deployment

This application can be deployed to Vercel or any hosting platform that supports Next.js.

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.
