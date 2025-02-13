import { supabase } from "../../../lib/supabase";
import axios from "axios";

export default async function handler(req: Request, res: Response) {
  try {
    console.log("Fetching latest patch version...");

    // Get the latest patch from Riot API
    const patchResponse = await axios.get(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const latestPatch = patchResponse.data[0]; // The latest patch version

    console.log(`Latest Patch: ${latestPatch}`);

    // Fetch champion data
    const response = await axios.get(
      `https://ddragon.leagueoflegends.com/cdn/${latestPatch}/data/en_US/champion.json`
    );
    const champions = Object.values(response.data.data);

    for (const champ of champions) {
      const { key, name, tags } = champ as { key: string; name: string; tags: string[] };

      console.log(`Processing: ${name} (${key})`);

      // Upsert (Insert or Update)
      const { data, error } = await supabase.from("champions").upsert([
        {
          champion_id: parseInt(key, 10),
          name,
          role: tags[0],
          patch_version: latestPatch, // Always update the patch version
        },
      ], { onConflict: ['champion_id'] }); // Prevent duplicate inserts

      if (error) {
        console.error(`Error updating ${name}:`, error.message);
      } else {
        console.log(`Updated ${name} to Patch ${latestPatch}`);
      }
    }

    res.status(200).json({ message: `Champion update completed for Patch ${latestPatch}!` });
  } catch (error) {
    console.error("Error fetching champions:", error);
    res.status(500).json({ error: "Failed to fetch champions" });
  }
}
