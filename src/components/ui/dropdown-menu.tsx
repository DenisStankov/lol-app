"use client"

import * as React from "react"
import { createContext, useContext, useState } from "react"

interface DropdownMenuContextType {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

function useDropdownMenu() {
  const context = useContext(DropdownMenuContext)
  if (!context) {
    throw new Error("useDropdownMenu must be used within a DropdownMenu provider")
  }
  return context
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

interface DropdownMenuTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export function DropdownMenuTrigger({ children, className, ...props }: DropdownMenuTriggerProps) {
  const { open, setOpen } = useDropdownMenu()

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  align?: "start" | "center" | "end"
}

export function DropdownMenuContent({ children, className, align = "center" }: DropdownMenuContentProps) {
  const { open, setOpen } = useDropdownMenu()
  
  // Handle clicking outside - moved above the conditional return
  React.useEffect(() => {
    // Only add the event listener if the menu is open
    if (!open) return;
    
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("[role='menu']")) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [open, setOpen])
  
  if (!open) return null

  const alignmentClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <div
      className={`absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-md border bg-white shadow-lg ${alignmentClasses[align]} ${className}`}
      role="menu"
    >
      {children}
    </div>
  )
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

export function DropdownMenuItem({ children, className, asChild, ...props }: DropdownMenuItemProps) {
  const { setOpen } = useDropdownMenu()
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't close if asChild is true (we're wrapping another interactive element)
    if (!asChild) {
      setOpen(false)
    }
    if (props.onClick) {
      props.onClick(e)
    }
  }

  // If asChild is true, clone the first child and add props
  if (asChild && React.Children.count(children) === 1) {
    const child = React.Children.only(children) as React.ReactElement;
    
    // Add type assertion for child.props
    const childProps = {
      ...props,
      className: `px-3 py-2 text-sm cursor-pointer ${className || ""}`,
      onClick: (e: React.MouseEvent) => {
        // Add type assertion for onClick
        const childOnClick = (child.props as any).onClick;
        if (typeof childOnClick === 'function') {
          childOnClick(e);
        }
        setOpen(false);
      },
    };
    
    return React.cloneElement(child, childProps);
  }

  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${className || ""}`}
      role="menuitem"
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={`my-1 h-px ${className || "bg-gray-200"}`} />
} 