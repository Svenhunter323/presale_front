import { useCountdown } from '../hooks/useCountdown.js'
import { clsx } from 'clsx'
import { Clock, CheckCircle, Pause, HelpCircle, Circle } from 'lucide-react'

export const StatusBar = ({ status, startTs, endTs, finalized }) => {
  const { timeRemaining: startCountdown, isExpired: hasStarted } = useCountdown(startTs)
  const { timeRemaining: endCountdown, isExpired: hasEnded } = useCountdown(endTs)

  const getStatusInfo = () => {
    switch (status) {
      case 0: // Not Started
        return {
          text: 'Not Started',
          subtext: hasStarted ? 'Starting soon...' : `Starts in: ${startCountdown}`,
          color: 'yellow',
          icon: <Clock className="w-6 h-6" />
        }
      case 1: // Live
        return {
          text: 'Live',
          subtext: hasEnded ? 'Ending soon...' : `Ends in: ${endCountdown}`,
          color: 'green',
          icon: <Circle className="w-6 h-6 fill-current" />
        }
      case 2: // Ended
        return {
          text: 'Ended',
          subtext: finalized ? 'Finalized' : 'Awaiting finalization',
          color: finalized ? 'blue' : 'gray',
          icon: finalized ? <CheckCircle className="w-6 h-6" /> : <Pause className="w-6 h-6" />
        }
      case 3: // Paused
        return {
          text: 'Paused',
          subtext: 'Sale temporarily paused',
          color: 'red',
          icon: <Pause className="w-6 h-6" />
        }
      default:
        return {
          text: 'Unknown',
          subtext: 'Status unknown',
          color: 'gray',
          icon: <HelpCircle className="w-6 h-6" />
        }
    }
  }

  const statusInfo = getStatusInfo()

  const colorClasses = {
    green: 'bg-green-900 border-green-700 text-green-100',
    yellow: 'bg-yellow-900 border-yellow-700 text-yellow-100',
    red: 'bg-red-900 border-red-700 text-red-100',
    blue: 'bg-blue-900 border-blue-700 text-blue-100',
    gray: 'bg-gray-900 border-gray-700 text-gray-100',
  }

  return (
    <div className={clsx(
      'rounded-lg border p-6 text-center',
      colorClasses[statusInfo.color]
    )}>
      <div className="flex items-center justify-center space-x-3 mb-2">
        <div className="text-2xl">{statusInfo.icon}</div>
        <h2 className="text-2xl font-bold">{statusInfo.text}</h2>
      </div>
      
      <p className="text-lg opacity-90">{statusInfo.subtext}</p>
      
      {/* Additional status indicators */}
      {status === 1 && (
        <div className="mt-4 flex justify-center">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Sale Active</span>
          </div>
        </div>
      )}
    </div>
  )
}
