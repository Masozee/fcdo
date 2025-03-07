"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { DashboardFooter } from "@/components/dashboard-footer"
import { Geist, Geist_Mono } from "next/font/google"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is a layout that completely replaces the root layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Simulate checking authentication
  useEffect(() => {
    // In a real app, you would check session/token validity here
    const checkAuth = () => {
      // For demo purposes, we'll just check if a user object exists in localStorage
      const user = localStorage.getItem('user')
      if (!user) {
        setIsAuthenticated(false)
        router.push('/login')
      } else {
        setIsAuthenticated(true)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render the dashboard with specific navbar and footer
  return isAuthenticated ? (
    <div className="flex min-h-screen flex-col [--header-height:calc(theme(spacing.14))]">
      {/* This will completely replace any content from the root layout */}
      <style jsx global>{`
        body {
          padding: 0;
          margin: 0;
        }
        
        .root-header, .root-footer {
          display: none !important;
        }
      `}</style>

      <SidebarProvider className="flex flex-1 flex-col">
        <DashboardNavbar />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <main className="flex-1">
              {children}
            </main>
            <DashboardFooter />
          </div>
        </div>
      </SidebarProvider>
    </div>
  ) : null
} 