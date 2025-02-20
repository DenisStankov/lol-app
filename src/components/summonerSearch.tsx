"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Search } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/card";
import { Input } from "@/components/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/select";

interface Summoner {
  summonerName: string;
  tagLine: string;
  puuid: string;
  profileIconId: number;
}

export default function SummonerSearch() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("euw1"); // Default region
  const [results, setResults] = useState<Summoner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // ✅ Fetch Summoner Suggestions
  const fetchSummoners = useCallback(async () => {
    if (query.length < 3) {
      setError("");
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`/api/searchSummoner?query=${encodeURIComponent(query)}&region=${region}`);
      setResults([res.data]); // Store results
    } catch (err) {
      console.error("❌ Search Error:", err);
      setError("Summoner not found.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, region]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 3) fetchSummoners();
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchSummoners]);

  // ✅ Handle Summoner Selection
  const handleSelect = (summoner: Summoner) => {
    const formattedName = `${summoner.summonerName}-${summoner.tagLine}`;
    router.push(`/summoner/${region}/${formattedName}`);
  };

  return (
    <Card className="border-[#C89B3C]/20 bg-zinc-900/50 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Input Field */}
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#C89B3C]" />
            <Input
              placeholder="Search summoner..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 w-full bg-zinc-800 border-[#C89B3C]/20 text-white placeholder:text-[#C89B3C]/60 focus:ring-[#C89B3C]/50 focus:border-[#C89B3C]/50"
            />
          </div>

          {/* Region Select Dropdown */}
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-24 h-12 bg-zinc-800 border-[#C89B3C]/20 text-[#C89B3C]">
              <SelectValue placeholder="EUW" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-[#C89B3C]/20">
              <SelectItem value="euw1">EUW</SelectItem>
              <SelectItem value="na1">NA</SelectItem>
              <SelectItem value="kr">KR</SelectItem>
              <SelectItem value="eun1">EUNE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 🔥 Search Results */}
        {results.length > 0 && (
          <div className="mt-3">
            {results.map((summoner) => (
              <div key={summoner.puuid} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#C89B3C]/20" onClick={() => handleSelect(summoner)}>
                <Image src={`https://ddragon.leagueoflegends.com/cdn/14.3.1/img/profileicon/${summoner.profileIconId}.png`} alt="Profile Icon" width={40} height={40} className="rounded-full" />
                <span>{summoner.summonerName}#{summoner.tagLine}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}