"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Crown, Swords, Target, Trophy } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import Navigation from "@/components/navigation";
import { useRouter } from "next/navigation";

export default function SummonerProfile() {
  const { region, name } = useParams(); // ✅ Get dynamic params from URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  interface Summoner {
    summonerName: string;
    tagLine: string;
    summonerLevel: number;
    profileIconId: number;
    rank: string;
    division: string;
    leaguePoints: number;
    winRate: number;
    wins: number;
    loses: number;
    matchHistory: { matchId: string; champion: string; result: string; kills: number; deaths: number; assists: number }[];
  }

  const [summoner, setSummoner] = useState<Summoner | null>(null);

  // ✅ Extract gameName and tagLine from name (e.g., "KIRETOE-PEKAR")
  const nameStr = Array.isArray(name) ? name[0] : name; // Ensure `name` is a string
  const gameName = nameStr?.split("-")[0];
  const tagLine = nameStr?.split("-")[1];

  useEffect(() => {
    if (!gameName || !tagLine || !region) {
      console.log("❌ Missing query params!");
      setError("Invalid summoner information in URL. Please try searching again.");
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching Summoner Data:", { gameName, tagLine, region });

    axios
      .get(`/api/fetchSummoner?gameName=${gameName}&tagLine=${tagLine}&region=${region}`)
      .then((res) => {
        console.log("✅ Summoner data received:", res.data);
        setSummoner(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("❌ API Fetch Error:", err);
        const errorMessage = err.response?.data?.error || 
                            "Summoner not found. Make sure the summoner name and region are correct.";
        setError(errorMessage);
        setLoading(false);
      });
  }, [gameName, tagLine, region]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin inline-block w-10 h-10 border-[3px] border-current border-t-transparent text-[#C89B3C] rounded-full mb-4"></div>
        <p className="text-lg text-[#C89B3C]">Loading Summoner Data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-md p-8 bg-zinc-900/70 rounded-xl border border-red-500/30">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Summoner Not Found</h2>
        <p className="text-zinc-300 mb-6">{error}</p>
        <div className="flex justify-center">
          <Button 
            onClick={() => router.push('/')}
            className="bg-[#C89B3C]/20 text-[#C89B3C] hover:bg-[#C89B3C]/30"
          >
            Back to Search
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Navigation Bar */}
      <Navigation />
      
      {/* Header Section */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#C89B3C]/20 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#C89B3C]/20">
                <Image
                  src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner?.profileIconId}.png`}
                  alt="Summoner Icon"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-[#C89B3C] tracking-tight">
                {summoner?.summonerName}
              </h1>
              <div className="flex items-center justify-center gap-3">
                <span className="text-zinc-400">#{summoner?.tagLine}</span>
                <div className="px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm font-medium">
                  Level {summoner?.summonerLevel}
                </div>
              </div>
              <Button className="bg-[#C89B3C]/10 text-[#C89B3C] hover:bg-[#C89B3C]/20 border-0">
                Update Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Trophy, label: "Rank", value: `${summoner?.rank || "Unranked"} ${summoner?.division || ""}`, sub: `${summoner?.leaguePoints || 0} LP` },
            { icon: Swords, label: "Win Rate", value: `${summoner?.winRate || 0}%`, sub: `Total Games: ${summoner?.wins ?? 0 + (summoner?.loses ?? 0)}` },
            { icon: Target, label: "KDA", value: "3.2:1", sub: "Kills/Deaths/Assists Avg." },
            { icon: Crown, label: "Top Role", value: "Mid", sub: "Most played role" },
          ].map((stat, i) => (
            <Card key={i} className="border-zinc-800/50 bg-zinc-900/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#C89B3C] mt-1">{stat.value}</p>
                    <p className="text-sm text-zinc-400 mt-1">{stat.sub}</p>
                  </div>
                  <stat.icon className="h-5 w-5 text-[#C89B3C]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Match History */}
        <Card className="border-zinc-800/50 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-[#C89B3C]">Match History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summoner?.matchHistory?.length ? (
                summoner.matchHistory.map((match, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-lg ${match.result === "Victory" ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-zinc-800/50 overflow-hidden">
                      <Image
                        src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/champion/${match.champion}.png`}
                        alt="Champion"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={match.result === "Victory" ? "text-emerald-400" : "text-red-400"}>
                          {match.result}
                        </span>
                        <span className="text-sm text-zinc-400">KDA: {match.kills}/{match.deaths}/{match.assists}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white">Ranked Solo/Duo</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-400">No match history available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <p className="text-sm text-zinc-400 text-center">
            © {new Date().getFullYear()} League Stats Tracker. Not affiliated with Riot Games.
          </p>
        </div>
      </footer>
    </div>
  );
}