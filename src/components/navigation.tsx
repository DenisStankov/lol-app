"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, User, ChevronDown, Settings, BarChart2, Shield } from "lucide-react"
import { getLogoutUrl } from "@/lib/auth-utils"
import { getAuthUrl } from "@/lib/auth-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"

interface UserInfo {
  sub: string
  name: string
  puuid?: string
  profileIconId?: number
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [patchVersion, setPatchVersion] = useState("14.8.1") // Default fallback version
  const pathname = usePathname()

  // Fetch current patch version for icon URLs
  useEffect(() => {
    async function fetchPatchVersion() {
      try {
        const response = await axios.get("https://ddragon.leagueoflegends.com/api/versions.json")
        setPatchVersion(response.data[0])
      } catch (error) {
        console.error("Failed to fetch patch version:", error)
      }
    }
    
    fetchPatchVersion()
  }, [])

  // Check if user is logged in
  useEffect(() => {
    // Make sure document.cookie exists and isn't empty before splitting
    if (typeof document !== 'undefined' && document.cookie) {
      const userCookie = document.cookie.split(";").find((c) => c.trim().startsWith("user_info="))
      if (userCookie) {
        try {
          const userInfo = JSON.parse(decodeURIComponent(userCookie.split("=")[1]))
          setUser(userInfo)
          
          // If user is logged in, fetch their summoner profile for the icon ID
          if (userInfo.sub) {
            fetchUserProfile(userInfo)
          }
        } catch (e) {
          console.error("Error parsing user info cookie", e)
        }
      }
    }
    setIsLoading(false)
  }, [])
  
  // Fetch user's profile data to get the profile icon ID
  async function fetchUserProfile(userInfo: UserInfo) {
    try {
      const response = await axios.get(`/api/fetchSummoner?riotId=${userInfo.sub}`)
      if (response.data && response.data.profileIconId) {
        setUser({
          ...userInfo,
          profileIconId: response.data.profileIconId,
          puuid: response.data.puuid
        })
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
    }
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Champions", href: "/champions" },
    { name: "Tier List", href: "/tier-list" },
    { name: "Leaderboards", href: "/leaderboards" },
    { name: "Stats", href: "/stats" },
  ]

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    // Add defensive check to prevent errors when name is undefined or empty
    if (!name || typeof name !== 'string') {
      return "U"; // Default to "U" for User if no name is available
    }
    
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }
  
  // Get profile icon URL
  const getProfileIconUrl = (iconId: number) => {
    return `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/profileicon/${iconId}.png`
  }

  return (
    <nav className="bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-[#C89B3C] text-xl">LoLytics</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname === item.href
                        ? "bg-[#C89B3C]/20 text-[#C89B3C]"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    } transition-colors`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoading &&
              (user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 transition-colors">
                    <Avatar className="h-7 w-7 border-2 border-[#C89B3C]/70">
                      {user.profileIconId ? (
                        <AvatarImage 
                          src={getProfileIconUrl(user.profileIconId)} 
                          alt={user.name} 
                          className="bg-[#0A1428]"
                        />
                      ) : (
                        <AvatarFallback className="bg-[#0A1428] text-[#C89B3C] text-xs font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-zinc-200 font-medium text-sm">{user.name}</span>
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border border-zinc-800 text-zinc-200">
                    <div className="px-2 py-2.5 border-b border-zinc-800">
                      <p className="text-xs font-medium text-zinc-400">Signed in as</p>
                      <p className="text-sm font-semibold text-[#C89B3C]">{user.name}</p>
                    </div>
                    <DropdownMenuItem className="flex items-center gap-2 hover:bg-zinc-800 focus:bg-zinc-800">
                      <User className="w-4 h-4 text-zinc-400" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 hover:bg-zinc-800 focus:bg-zinc-800">
                      <BarChart2 className="w-4 h-4 text-zinc-400" />
                      <span>My Stats</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 hover:bg-zinc-800 focus:bg-zinc-800">
                      <Settings className="w-4 h-4 text-zinc-400" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-[#E84057] hover:bg-zinc-800 focus:bg-zinc-800"
                      asChild
                    >
                      <a href={getLogoutUrl()}>
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <a
                  href={getAuthUrl()}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-[#C89B3C] to-[#785A28] text-zinc-900 hover:from-[#D5B45C] hover:to-[#8E6B32] transition-colors shadow-md"
                >
                  <Shield className="w-4 h-4" />
                  <span>Login with Riot</span>
                </a>
              ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-zinc-800 inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 focus:outline-none"
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-zinc-900 border-b border-zinc-800">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? "bg-[#C89B3C]/20 text-[#C89B3C]"
                    : "text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile auth buttons */}
            {!isLoading &&
              (user ? (
                <div className="mt-3 pt-3 border-t border-zinc-700">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <Avatar className="h-8 w-8 border-2 border-[#C89B3C]/70">
                      {user.profileIconId ? (
                        <AvatarImage 
                          src={getProfileIconUrl(user.profileIconId)} 
                          alt={user.name}
                          className="bg-[#0A1428]"
                        />
                      ) : (
                        <AvatarFallback className="bg-[#0A1428] text-[#C89B3C] text-xs font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-zinc-200 font-medium">{user.name}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/my-stats"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart2 className="w-4 h-4 text-zinc-400" />
                    <span>My Stats</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Settings</span>
                  </Link>
                  <a
                    href={getLogoutUrl()}
                    className="flex items-center gap-2 px-3 py-2 mt-2 rounded-md text-base font-medium text-[#E84057] hover:bg-zinc-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </a>
                </div>
              ) : (
                <a
                  href={getAuthUrl()}
                  className="flex items-center justify-center gap-2 mx-2 mt-3 px-4 py-2.5 rounded-md text-base font-medium bg-gradient-to-r from-[#C89B3C] to-[#785A28] text-zinc-900 hover:from-[#D5B45C] hover:to-[#8E6B32]"
                >
                  <Shield className="w-5 h-5" />
                  <span>Login with Riot</span>
                </a>
              ))}
          </div>
        </div>
      )}
    </nav>
  )
} 