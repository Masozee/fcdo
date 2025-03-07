"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = () => {
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      // Remove user from localStorage
      localStorage.removeItem('user')
      setIsLoading(false)
      router.push('/login')
    }, 500)
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        "Logging out..."
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  )
} 