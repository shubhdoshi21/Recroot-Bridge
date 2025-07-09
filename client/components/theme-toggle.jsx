"use client"

import { Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export function ThemeToggle() {
  // Force light mode on component mount
  useEffect(() => {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
    localStorage.setItem("theme", "light")
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
      aria-label="Light mode"
      disabled
    >
      <Sun className="h-5 w-5" />
    </Button>
  )
}
