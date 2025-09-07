import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useReferral } from '../hooks/useReferral.js'
import { subscribeEmail } from '../lib/api.js'
import { useToast } from './Toasts.jsx'
import { clsx } from 'clsx'
import { CheckCircle } from 'lucide-react'

export const EmailCapture = () => {
  const { address } = useAccount()
  const { referrer } = useReferral()
  const { success, error: showError } = useToast()
  
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('') // Hidden field for bot detection
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypot) {
      console.log('Bot detected via honeypot')
      return
    }

    if (!email || !email.includes('@')) {
      showError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      await subscribeEmail({
        email,
        wallet: address,
        referrer: referrer,
        utm: {
          source: 'presale_website',
          medium: 'email_capture',
          campaign: 'token_presale'
        }
      })

      setIsSubscribed(true)
      setEmail('')
      success('Successfully subscribed to updates!')
      
    } catch (error) {
      showError(error.message || 'Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4"><CheckCircle className="w-16 h-16 text-green-500 mx-auto" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Successfully Subscribed!</h3>
          <p className="text-gray-300">
            Thank you for subscribing. You'll receive important updates about the presale and token launch.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Stay Updated</h3>
      
      <div className="mb-4">
        <p className="text-gray-300 text-sm">
          Subscribe to receive important updates about the presale, token launch, and exclusive announcements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className={clsx(
            'w-full py-3 px-4 rounded-lg font-medium transition-colors',
            isSubmitting || !email
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Subscribing...</span>
            </div>
          ) : (
            'Subscribe to Updates'
          )}
        </button>
      </form>

      {/* Privacy Notice */}
      <div className="mt-4 text-xs text-gray-400">
        <p>
          We respect your privacy. Your email will only be used for presale updates and important announcements. 
          You can unsubscribe at any time.
        </p>
      </div>

      {/* Benefits */}
      <div className="mt-4 bg-primary-900/20 border border-primary-700/30 rounded-lg p-3">
        <div className="text-sm text-primary-200">
          <div className="font-medium mb-2"> What you'll receive:</div>
          <ul className="space-y-1 text-xs">
            <li>• Presale status updates and milestones</li>
            <li>• Token launch and listing announcements</li>
            <li>• Exclusive early access opportunities</li>
            <li>• Important deadline reminders</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
