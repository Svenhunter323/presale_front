import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { isValidAddress } from '../lib/format.js'
import { logReferralTouch } from '../lib/api.js'

const REFERRAL_KEY = 'presale_referrer'

export const useReferral = () => {
  const { address } = useAccount()
  const [referrer, setReferrer] = useState(null)
  const [userReferralLink, setUserReferralLink] = useState('')

  // Parse referral from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const refParam = urlParams.get('ref')
    
    if (refParam && isValidAddress(refParam)) {
      // Store referrer in sessionStorage
      sessionStorage.setItem(REFERRAL_KEY, refParam)
      setReferrer(refParam)
      
      // Log referral touch (don't await)
      logReferralTouch({
        referrer: refParam,
        visitor: address || null,
      }).catch(console.error)
      
      // Clean URL without refreshing
      const cleanUrl = new URL(window.location)
      cleanUrl.searchParams.delete('ref')
      window.history.replaceState({}, document.title, cleanUrl.toString())
    } else {
      // Check if we have a stored referrer
      const storedReferrer = sessionStorage.getItem(REFERRAL_KEY)
      if (storedReferrer && isValidAddress(storedReferrer)) {
        setReferrer(storedReferrer)
      }
    }
  }, [address])

  // Generate user's referral link when connected
  useEffect(() => {
    if (address) {
      const baseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin
      setUserReferralLink(`${baseUrl}?ref=${address}`)
    } else {
      setUserReferralLink('')
    }
  }, [address])

  const copyReferralLink = async () => {
    if (!userReferralLink) return false
    
    try {
      await navigator.clipboard.writeText(userReferralLink)
      return true
    } catch (error) {
      console.error('Failed to copy referral link:', error)
      return false
    }
  }

  const shareReferralLink = (platform) => {
    if (!userReferralLink) return

    const text = 'Join the presale and get exclusive access to tokens!'
    const url = encodeURIComponent(userReferralLink)
    const encodedText = encodeURIComponent(text)

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}&utm_source=twitter&utm_medium=social&utm_campaign=referral`,
      telegram: `https://t.me/share/url?url=${url}&text=${encodedText}&utm_source=telegram&utm_medium=social&utm_campaign=referral`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&utm_source=facebook&utm_medium=social&utm_campaign=referral`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&utm_source=linkedin&utm_medium=social&utm_campaign=referral`,
    }

    const shareUrl = shareUrls[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const clearReferrer = () => {
    sessionStorage.removeItem(REFERRAL_KEY)
    setReferrer(null)
  }

  return {
    referrer,
    userReferralLink,
    hasReferrer: !!referrer,
    copyReferralLink,
    shareReferralLink,
    clearReferrer,
  }
}
