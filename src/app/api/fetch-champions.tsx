import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import axios from "axios";

export async function GET() {
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
      const championId = parseInt(key, 10);

      console.log(`Processing: ${name} (${key})`);

      // Upsert (Insert or Update)
      const { error } = await supabase
        .from("champions")
        .upsert([
          {
            champion_id: championId,
            name: name,
            role: tags[0] || "Unknown", // Use first tag as role
            patch_version: latestPatch,
            tags: tags.join(", "), // ✅ Convert array to a comma-separated string
          },
        ]);

      if (error) {
        console.error(`Error updating ${name}:`, error.message);
      } else {
        console.log(`Updated ${name} to Patch ${latestPatch}`);
      }
    }

    return NextResponse.json({ message: `Champion update completed for Patch ${latestPatch}!` }, { status: 200 });
  } catch (error) {
    console.error("Error fetching champions:", error);
    return NextResponse.json({ error: "Failed to fetch champions" }, { status: 500 });
  }
}