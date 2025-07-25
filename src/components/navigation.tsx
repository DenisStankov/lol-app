"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Settings,
  Shield,
  Home,
  Trophy,
  Activity,
  Crown,
  Search,
  Sparkles,
} from "lucide-react"
import { getLogoutUrl } from "@/lib/auth-utils"
import { getAuthUrl } from "@/lib/auth-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"
import ProfileIcon from "@/components/ProfileIcon"
import { Input } from "@/components/ui/input"

interface UserInfo {
  sub: string
  name: string
  puuid?: string
  profileIconId?: number
  summonerName?: string
}

interface NavigationProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export default function Navigation({ searchValue, onSearchChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  // Fetch current patch version for icon URLs
  useEffect(() => {
    async function fetchPatchVersion() {
      try {
        await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
      } catch {
        // Silently handle error
      }
    }

    fetchPatchVersion()
  }, [])

  // Check if user is logged in
  useEffect(() => {
    async function initUser() {
      setIsLoading(true)

      try {
        if (typeof document !== "undefined" && document.cookie) {
          const userCookie = document.cookie.split(";").find((c) => c.trim().startsWith("user_info="))
          if (userCookie) {
            const userInfo = JSON.parse(decodeURIComponent(userCookie.split("=")[1]))

            // Set basic user info
            setUser(userInfo)

            // If user is logged in, fetch their summoner profile
            if (userInfo.sub) {
              await fetchUserProfile(userInfo)
            }
          }
        }
      } catch (e) {
        console.error("Error parsing user info cookie", e)
      } finally {
        setIsLoading(false)
      }
    }

    initUser()
  }, [])

  // Fetch user's profile data to get the profile icon ID and summoner name
  async function fetchUserProfile(userInfo: UserInfo) {
    try {
      // First try using auth token for authenticated endpoint
      const response = await axios.get("/api/fetchSummoner", {
        params: { riotId: userInfo.sub },
      })

      if (response.data) {
        // Extract profile icon ID, ensuring it's a number
        const profileIconId = Number.parseInt(String(response.data.profileIconId), 10)

        // Try multiple possible name fields from the API
        let summonerName = null
        if (response.data.name && typeof response.data.name === "string") {
          summonerName = response.data.name.trim()
        } else if (response.data.gameName && typeof response.data.gameName === "string") {
          summonerName = response.data.gameName.trim()
        } else if (response.data.riotId && typeof response.data.riotId === "string") {
          // Extract name part from Riot ID (format: "name#tag")
          const parts = response.data.riotId.split("#")
          if (parts.length > 0) {
            summonerName = parts[0].trim()
          }
        }

        // If we still don't have a name, use a hardcoded one for testing
        if (!summonerName) {
          summonerName = userInfo.name
        }

        // Update user state with summoner info
        const updatedUser = {
          ...userInfo,
          profileIconId: isNaN(profileIconId) ? undefined : profileIconId,
          puuid: response.data.puuid,
          summonerName: summonerName,
        }

        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)

      // Fallback: just use the name from the OAuth token
      setUser({
        ...userInfo,
        summonerName: userInfo.name,
      })
    }
  }

  const navigation = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4" /> },
    { name: "Champions", href: "/champions", icon: <Trophy className="w-4 h-4" /> },
    { name: "Tier List", href: "/tier-list", icon: <Crown className="w-4 h-4" /> },
    { name: "Leaderboards", href: "/leaderboards", icon: <Activity className="w-4 h-4" /> },
  ]

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") {
      return "U"
    }

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Get display name (prefer League summoner name if available)
  const getDisplayName = () => {
    if (user?.summonerName && typeof user.summonerName === "string" && user.summonerName.trim() !== "") {
      return user.summonerName
    } else if (user?.name && typeof user.name === "string" && user.name.trim() !== "") {
      return user.name
    } else if (user?.sub) {
      return user.sub.includes("#") ? user.sub : `Summoner #${user.sub.substring(0, 5)}`
    }

    return "Summoner"
  }

  return (
    <nav className="bg-gradient-to-r from-slate-950/95 to-purple-950/95 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-blue-500/30 rounded-full blur-sm group-hover:bg-blue-500/40 transition-all duration-300"></div>
                  <Sparkles className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-xl tracking-tight group-hover:from-blue-300 group-hover:to-purple-300 transition-all duration-300">
                  LoLytics
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-400/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      } transition-all duration-200 ease-in-out`}
                    >
                      <span className={isActive ? "text-blue-400" : "text-slate-400"}>{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                })}
                {/* Search bar for /leaderboards, desktop only */}
                {pathname === "/leaderboards" && (
                  <div className="ml-6 flex items-center relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="Search summoner..."
                      className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading &&
              (user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 transition-all duration-200">
                    <Avatar className="h-7 w-7 border-2 border-blue-400/70 ring-2 ring-slate-950">
                      {user?.profileIconId ? (
                        <div className="w-full h-full">
                          <ProfileIcon
                            iconId={user.profileIconId}
                            alt={getDisplayName()}
                            width={28}
                            height={28}
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white">
                          {getInitials(getDisplayName())}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm text-white">{getDisplayName()}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-900 border border-white/10">
                    <DropdownMenuItem className="text-white hover:bg-white/5 focus:bg-white/5">
                      <User className="mr-2 h-4 w-4 text-blue-400" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-white/5 focus:bg-white/5">
                      <Settings className="mr-2 h-4 w-4 text-blue-400" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="text-red-400 hover:bg-white/5 focus:bg-white/5">
                      <LogOut className="mr-2 h-4 w-4" />
                      <a href={getLogoutUrl()} className="w-full">
                        Log out
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  href={getAuthUrl()}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  <Shield className="h-4 w-4" />
                  Sign in with Riot
                </a>
              ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-slate-950/95 to-purple-950/95 backdrop-blur-xl">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 ring-1 ring-blue-400/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  } transition-all duration-200 ease-in-out`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className={isActive ? "text-blue-400" : "text-slate-400"}>{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-white/10">
            {!isLoading &&
              (user ? (
                <div className="space-y-1">
                  <div className="flex items-center px-4">
                    <Avatar className="h-10 w-10 border-2 border-blue-400/70 ring-2 ring-slate-950">
                      {user?.profileIconId ? (
                        <div className="w-full h-full">
                          <ProfileIcon
                            iconId={user.profileIconId}
                            alt={getDisplayName()}
                            width={40}
                            height={40}
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-white">
                          {getInitials(getDisplayName())}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{getDisplayName()}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <span>Profile</span>
                      </div>
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-blue-400" />
                        <span>Settings</span>
                      </div>
                    </Link>
                    <a
                      href={getLogoutUrl()}
                      className="block px-4 py-2 text-base font-medium text-red-400 hover:bg-white/5"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2">
                  <a
                    href={getAuthUrl()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Sign in with Riot
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Mobile search bar for /leaderboards */}
      {pathname === "/leaderboards" && (
        <div className="md:hidden px-4 pb-2">
          <div className="flex items-center relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search summoner..."
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}
    </nav>
  )
}
