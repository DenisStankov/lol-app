"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogIn, LogOut, User } from "lucide-react"
import { getLogoutUrl } from "@/lib/auth-utils"
import { getAuthUrl } from "@/lib/auth-config"

interface UserInfo {
  sub: string;
  name: string;
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  
  // Check if user is logged in
  useEffect(() => {
    const userCookie = document.cookie.split(';').find(c => c.trim().startsWith('user_info='));
    if (userCookie) {
      try {
        const userInfo = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
        setUser(userInfo);
      } catch (e) {
        console.error('Error parsing user info cookie', e);
      }
    }
    setIsLoading(false);
  }, []);
  
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Champions", href: "/champions" },
    { name: "Tier List", href: "/tier-list" },
    { name: "Leaderboards", href: "/leaderboards" },
    { name: "Stats", href: "/stats" },
  ]

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
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <a 
                    href={getLogoutUrl()}
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </a>
                </div>
              ) : (
                <a 
                  href={getAuthUrl()}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-[#C89B3C] hover:bg-[#C89B3C]/10 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login with Riot</span>
                </a>
              )
            )}
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
            {!isLoading && (
              user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 text-zinc-300">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                  <a 
                    href={getLogoutUrl()}
                    className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <a 
                  href={getAuthUrl()}
                  className="block px-3 py-2 rounded-md text-base font-medium text-[#C89B3C] hover:bg-[#C89B3C]/10"
                >
                  Login with Riot
                </a>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 