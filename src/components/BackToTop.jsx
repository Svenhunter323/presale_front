import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { clsx } from 'clsx'

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={clsx(
        "fixed bottom-8 right-8 z-40 p-3 rounded-full transition-all duration-300 shadow-lg",
        "bg-gradient-to-r from-primary-600 to-primary-700 text-white",
        "hover:from-primary-500 hover:to-primary-600 hover:shadow-xl hover:scale-110",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-10 pointer-events-none"
      )}
      aria-label="Back to top"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  )
}
