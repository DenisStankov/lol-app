"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/card"
import { Loader2, AlertCircle, ArrowUpCircle, FileText } from 'lucide-react'
import axios from "axios"

interface PatchNote {
  type: string
  title: string
}

export default function PatchInfo() {
  const [patchVersion, setPatchVersion] = useState<string>("")
  const [recentChanges, setRecentChanges] = useState<PatchNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchPatchInfo = async () => {
      try {
        setIsLoading(true)
        // Fetch current patch version
        const response = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        const currentPatch = response.data[0]
        setPatchVersion(currentPatch)
        
        // Try to fetch patch notes from your API
        try {
          const patchNotesResponse = await axios.get(`/api/patch-notes?version=${currentPatch}`)
          setRecentChanges(patchNotesResponse.data)
        } catch {
          // Fallback patch notes if API fails
          setRecentChanges([
            { type: "Champion", title: "Champion balance updates" },
            { type: "Item", title: "Item system changes" },
            { type: "System", title: "Ranked adjustments" },
            { type: "Balance", title: "Champion reworks and adjustments" },
            { type: "Feature", title: "UI/UX improvements" },
          ])
        }
      } catch (err) {
        setError("Failed to fetch patch version")
        console.error("Error fetching patch version:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPatchInfo()
  }, [])

  return (
    <Card className="relative overflow-hidden bg-bg-main/50 border-border/50 backdrop-blur-sm h-full flex flex-col">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />

      <div className="relative p-6 space-y-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-text-main">Current Patch</h2>
          </div>
          <p className="text-sm text-text-secondary">Latest game updates and changes</p>
        </div>

        {/* Version Display */}
        <div className="flex items-center justify-center py-6 flex-grow">
          {isLoading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : error ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <div className="text-center">
              <div className="relative">
                <span className="text-5xl font-bold text-accent tracking-tight
                  [text-shadow:0_0_20px_rgba(200,155,60,0.2)]
                  animate-pulse">
                  {patchVersion}
                </span>
                {/* Glowing dot */}
                <span className="absolute -right-3 -top-1 w-2 h-2 rounded-full bg-accent 
                  shadow-[0_0_10px_rgba(200,155,60,0.5)] animate-pulse" />
              </div>
              <p className="mt-2 text-sm text-text-secondary">Live Now</p>
            </div>
          )}
        </div>

        {/* Recent Changes */}
        <div className="space-y-3 mt-auto">
          <h3 className="text-sm font-medium text-text-secondary">Recent Changes</h3>
          <div className="space-y-2">
            {recentChanges.map((note, index) => (
              <div
                key={index}
                className="group flex items-center gap-3 p-2 rounded-lg 
                  bg-bg-card hover:bg-bg-card-hover transition-colors"
              >
                <FileText className="w-4 h-4 text-accent opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1">
                  <p className="text-sm text-text-secondary group-hover:text-text-main transition-colors">
                    {note.title}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent">
                  {note.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
        from-transparent via-accent/50 to-transparent" />
    </Card>
  )
}
