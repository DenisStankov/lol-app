"use client"

import * as React from "react"
import Image from "next/image"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border ${className || ""}`}
      {...props}
    />
  )
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, 'src'> {
  className?: string
  src: string
}

export function AvatarImage({ className, alt = "", src, ...props }: AvatarImageProps) {
  return (
    <Image
      className={`aspect-square h-full w-full object-cover ${className || ""}`}
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 50vw"
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
      className={`flex h-full w-full items-center justify-center rounded-full bg-bg-card text-text-secondary ${className || ""}`}
      {...props}
    />
  )
} 