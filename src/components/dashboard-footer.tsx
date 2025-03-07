"use client"

import { HeartIcon } from "lucide-react"

export function DashboardFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="w-full border-t bg-background py-3">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} Acme Inc. All rights reserved.
        </p>
        
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Terms of Service
          </a>
          <a 
            href="#" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Support
          </a>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Made with <HeartIcon className="inline h-3 w-3 text-red-500" /> by the Admin Team
        </p>
      </div>
    </footer>
  )
} 