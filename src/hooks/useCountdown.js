import { useState, useEffect } from 'react'
import { formatTimeRemaining } from '../lib/format.js'

export const useCountdown = (targetTimestamp) => {
  const [timeRemaining, setTimeRemaining] = useState({ expired: false, text: '' })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeRemaining({ expired: true, text: 'Invalid timestamp' })
      setIsExpired(true)
      return
    }

    const updateCountdown = () => {
      const result = formatTimeRemaining(targetTimestamp)
      setTimeRemaining(result)
      setIsExpired(result.expired)
    }

    // Update immediately
    updateCountdown()

    // Update every second
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetTimestamp])

  return {
    timeRemaining: timeRemaining.text,
    isExpired,
    days: timeRemaining.days || 0,
    hours: timeRemaining.hours || 0,
    minutes: timeRemaining.minutes || 0,
    seconds: timeRemaining.seconds || 0,
  }
}
