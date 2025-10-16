"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Crown, Swords, Target, Trophy } from "lucide-react";
import axios from "axios";
import Navigation from "@/components/navigation";
import ProfileIcon from "@/components/ProfileIcon";
import ChampionIcon from "@/components/ChampionIcon";

export default function SummonerProfile() {
  // Fix type error by defining the expected shape of params
  type Params = {
    region: string;
    name: string;
  };
  
  // Cast useParams() to our Params type
  const params = useParams() as Params;
  const { region, name } = params;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  interface Summoner {
    summonerName?: string;
    tagLine?: string;
    summonerLevel?: number;
    profileIconId?: number;
    rank?: string;
    division?: string;
    leaguePoints?: number;
    winRate?: number;
    wins?: number;
    loses?: number;
    matchHistory?: { matchId: string; champion: string; result: string; kills: number; deaths: number; assists: number }[];
  }

  const [summoner, setSummoner] = useState<Summoner | null>(null);

  // Accept either /name?puuid=... or legacy /name-tag routing
  const nameParam = Array.isArray(name) ? name[0] : name;
  const decodedName = nameParam ? decodeURIComponent(nameParam) : "";
  const delimiter = decodedName.includes("-") ? "-" : decodedName.includes("#") ? "#" : null;
  const [gameNamePart, ...rest] = delimiter ? decodedName.split(delimiter) : [decodedName];
  const gameName = gameNamePart?.trim();
  const tagLine = rest.length > 0 ? rest.join(delimiter ?? "").trim() : undefined;

  useEffect(() => {
    if (!region) {
      setLoading(false);
      setError("Missing region");
      return;
    }

    let isMounted = true;

    const fetchSummonerProfile = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const puuid = urlParams.get("puuid");

      let requestUrl = "";
      if (puuid) {
        requestUrl = `/api/fetchSummoner?puuid=${encodeURIComponent(puuid)}&region=${region}&isSearched=true`;
      } else if (gameName && tagLine) {
        requestUrl = `/api/fetchSummoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}&isSearched=true`;
      } else if (gameName) {
        // Fallback: try by-name in region directly
        requestUrl = `/api/searchSummoner?query=${encodeURIComponent(gameName)}&region=${region}`;
      } else {
        if (isMounted) {
          setLoading(false);
          setError("Missing summoner name");
        }
        return;
      }

      setLoading(true);

      try {
        const res = await axios.get(requestUrl);
        if (requestUrl.includes("/api/searchSummoner")) {
          const list = Array.isArray(res.data) ? res.data : [res.data];
          const first = list[0];

          if (!first) {
            throw new Error("Summoner not found");
          }

          if (first.puuid) {
            try {
              const detailRes = await axios.get(
                `/api/fetchSummoner?puuid=${encodeURIComponent(first.puuid)}&region=${encodeURIComponent(first.region || region)}&isSearched=true`
              );
              const detailData = Array.isArray(detailRes.data) ? detailRes.data[0] : detailRes.data;
              if (isMounted) {
                setSummoner(detailData);
              }
              return;
            } catch (detailErr) {
              console.error("❌ Detail fetch error:", detailErr);
            }
          }

          if (isMounted) {
            setSummoner(first);
          }
        } else {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          if (isMounted) {
            setSummoner(data);
          }
        }
      } catch (err) {
        console.log("❌ API Fetch Error:", err);
        if (isMounted) {
          setError("Summoner not found.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummonerProfile();

    return () => {
      isMounted = false;
    };
  }, [gameName, tagLine, region]);

  if (loading) return <div className="text-center text-[#C89B3C]">Still Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

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
                <ProfileIcon
                  iconId={summoner?.profileIconId}
                  alt="Summoner Icon"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-[#C89B3C] tracking-tight">
                {summoner?.summonerName}
              </h1>
              <div className="flex items-center justify-center gap-3">
                {summoner?.tagLine && (
                  <span className="text-zinc-400">#{summoner.tagLine}</span>
                )}
                <div className="px-3 py-1 rounded-full bg-[#C89B3C]/10 text-[#C89B3C] text-sm font-medium">
                  Level {summoner?.summonerLevel}
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-zinc-500">
                    Icon ID: {summoner?.profileIconId !== undefined ? summoner.profileIconId : 'Not available'}
                  </div>
                )}
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
                      <ChampionIcon
                        championId={match.champion}
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