# Setting Up Your Riot API Key

To get real champion data including runes, items, counters, and synergies, you need to add a valid Riot API key to your project.

## Getting a Riot API Key

1. Go to the [Riot Developer Portal](https://developer.riotgames.com/)
2. Sign in with your Riot Games account (create one if you don't have it)
3. Register as a developer if you haven't already
4. Generate a Development API Key

## Adding the Key to Your Project

1. In the root folder of your project (where package.json is), create or edit the `.env.local` file
2. Add your Riot API key in this format:
   ```
   NEXT_PUBLIC_RIOT_API_KEY=RGAPI-your-actual-key-here
   ```
3. Save the file and restart your development server:
   ```
   npm run dev
   ```

## Verifying Your API Key

After adding your key, you can verify it's working by visiting:
`http://localhost:3000/api/test-riot-key`

You should see a success message if your key is valid.

## Important Notes

1. Development API keys expire after 24 hours. You'll need to regenerate them.
2. API keys have rate limits (20 requests per second, 100 requests per 2 minutes)
3. For production, you should apply for a Production API Key from Riot
4. Never commit your API key to version control (Git)

## Troubleshooting

If you're still seeing mock data:
1. Check that your API key is valid and not expired
2. Verify the format in .env.local is correct (no spaces, quotes, etc.)
3. Restart your development server
4. Clear your browser cache or use an incognito window
5. Check the browser console and server logs for errors

For more information, visit the [Riot Developer Portal Documentation](https://developer.riotgames.com/docs/portal). 