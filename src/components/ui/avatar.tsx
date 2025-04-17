"use client"

import * as React from "react"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ""}`}
      {...props}
    />
  )
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string
}

export function AvatarImage({ className, alt = "", ...props }: AvatarImageProps) {
  return (
    <img
      className={`aspect-square h-full w-full object-cover ${className || ""}`}
      alt={alt}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-gray-700 ${className || ""}`}
      {...props}
    />
  )
} 