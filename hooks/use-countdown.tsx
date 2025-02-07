"use client"

import { useState, useEffect } from "react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
  isExpired: boolean
}

// Move calculateTimeLeft outside the hook
const calculateTimeLeft = (targetDate: Date): TimeLeft => {
  const now = new Date().getTime()
  const distance = targetDate.getTime() - now

  // Check if the target date is in the past
  if (distance < 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0,
      isExpired: true,
    }
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    total: distance,
    isExpired: false,
  }
}

export function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate)
      setTimeLeft(newTimeLeft)

      // Clear interval when countdown expires
      if (newTimeLeft.isExpired) {
        clearInterval(timer)
      }
    }, 1000)

    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [targetDate]) // Only depend on targetDate

  return timeLeft
}

