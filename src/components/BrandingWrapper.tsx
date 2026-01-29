'use client'

import { useEffect, useState } from 'react'

interface BrandingWrapperProps {
  children: React.ReactNode
  showBranding?: boolean
}

interface User {
  plan: 'free' | 'pro' | 'enterprise'
}

export default function BrandingWrapper({ children, showBranding = true }: BrandingWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isWhiteLabel, setIsWhiteLabel] = useState(false)

  useEffect(() => {
    // Check if user is logged in and has Enterprise plan
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsWhiteLabel(parsedUser.plan === 'enterprise')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  // If Enterprise user and showBranding is false, don't show branding
  if (isWhiteLabel && !showBranding) {
    return <>{children}</>
  }

  // Show branding for all other cases
  return <>{children}</>
}

// Hook to check if current user has white-label access
export function useWhiteLabel() {
  const [isWhiteLabel, setIsWhiteLabel] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setIsWhiteLabel(parsedUser.plan === 'enterprise')
      } catch (error) {
        setIsWhiteLabel(false)
      }
    }
  }, [])

  return isWhiteLabel
}