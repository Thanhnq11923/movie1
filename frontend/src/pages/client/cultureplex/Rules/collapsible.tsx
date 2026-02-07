"use client"

import * as React from "react"

interface CollapsibleProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

export const Collapsible: React.FC<CollapsibleProps> = ({ open, onOpenChange, children }) => {
  const handleClick = () => {
    if (onOpenChange) {
      onOpenChange(!open)
    }
  }

  return (
    <div data-state={open ? "open" : "closed"} onClick={handleClick}>
      {children}
    </div>
  )
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({ children, className, onClick }) => {
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
} 