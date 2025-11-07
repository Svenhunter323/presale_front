import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const TIME_PERIODS = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
]

export const BNBPriceChart = () => {
  const [priceData, setPriceData] = useState({
    price: 0,
    change24h: 0,
    isLoading: true
  })

  const [chartPoints, setChartPoints] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS[0]) // Default 1D
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [hoveredData, setHoveredData] = useState(null)
  const [timestamps, setTimestamps] = useState([])
  const [lastFetchTime, setLastFetchTime] = useState(null)
  const [chartHeight, setChartHeight] = useState(120) // Dynamic chart height in pixels

  // Fetch current BNB price
  useEffect(() => {
    const fetchBNBPrice = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true'
        )
        const data = await response.json()
        
        if (data.binancecoin) {
          setPriceData({
            price: data.binancecoin.usd,
            change24h: data.binancecoin.usd_24h_change || 0,
            isLoading: false
          })
        }
      } catch (error) {
        console.error('Error fetching BNB price:', error)
        setPriceData({
          price: 0,
          change24h: 0,
          isLoading: false
        })
      }
    }

    fetchBNBPrice()
    const interval = setInterval(fetchBNBPrice, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch historical chart data based on selected period
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${selectedPeriod.days}`
        )
        const data = await response.json()
        
        if (data.prices && data.prices.length > 0) {
          // Extract price values and timestamps
          const prices = data.prices.map(point => point[1])
          const times = data.prices.map(point => point[0])
          setChartPoints(prices)
          setTimestamps(times)
          setLastFetchTime(new Date())
          
          // Calculate min and max for price labels
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          setPriceRange({ min, max })
        }
      } catch (error) {
        console.error('Error fetching historical data:', error)
      }
    }

    if (priceData.price > 0) {
      fetchHistoricalData()
    }
  }, [selectedPeriod, priceData.price])

  const isPositive = priceData.change24h >= 0

  // Format timestamp based on selected period
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    if (selectedPeriod.days === 1) {
      // 1D: Show time
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (selectedPeriod.days <= 7) {
      // 1W: Show day and time
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })
    } else {
      // 1M+: Show date
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Handle mouse move on chart
  const handleChartMouseMove = (e) => {
    const chartContainer = e.currentTarget
    const rect = chartContainer.getBoundingClientRect()
    
    // Account for the 48px (3rem = pl-12) left padding for price labels
    const leftPadding = 48
    const x = e.clientX - rect.left - leftPadding
    const chartWidth = rect.width - leftPadding
    
    const percentage = Math.max(0, Math.min(1, x / chartWidth))
    const index = Math.floor(percentage * chartPoints.length)
    
    if (index >= 0 && index < chartPoints.length) {
      setHoveredData({
        price: chartPoints[index],
        time: timestamps[index],
        x: percentage * 100
      })
    }
  }

  const handleChartMouseLeave = () => {
    setHoveredData(null)
  }

  // Generate SVG path for the chart
  const generatePath = () => {
    if (chartPoints.length === 0) return ''
    
    const width = 100
    const height = 40
    const verticalPadding = 6 // Add padding for labels
    const chartHeight = height - (verticalPadding * 2)
    const max = Math.max(...chartPoints)
    const min = Math.min(...chartPoints)
    const range = max - min || 1
    
    const points = chartPoints.map((value, index) => {
      const x = (index / (chartPoints.length - 1)) * width
      const y = height - verticalPadding - ((value - min) / range) * chartHeight
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  // Get peak positions
  const getPeakPositions = () => {
    if (chartPoints.length === 0) return { highPos: null, lowPos: null }
    
    const verticalPadding = 6 // Match padding from generatePath
    const height = 40
    const chartHeight = height - (verticalPadding * 2)
    const max = Math.max(...chartPoints)
    const min = Math.min(...chartPoints)
    const range = max - min || 1
    
    const highIndex = chartPoints.indexOf(max)
    const lowIndex = chartPoints.indexOf(min)
    
    const highX = (highIndex / (chartPoints.length - 1)) * 100
    const highY = height - verticalPadding - ((max - min) / range) * chartHeight
    
    const lowX = (lowIndex / (chartPoints.length - 1)) * 100
    const lowY = height - verticalPadding - ((min - min) / range) * chartHeight
    
    return {
      highPos: { x: highX, y: highY, price: max },
      lowPos: { x: lowX, y: lowY, price: min }
    }
  }

  const { highPos, lowPos } = getPeakPositions()

  if (priceData.isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 hover:border-primary-500/50 transition-all duration-300"
    >
      {/* Header */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 mb-1">BNB</div>
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-2xl font-bold text-white">
            ${hoveredData ? hoveredData.price.toFixed(2) : priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {isPositive ? '+' : ''}{priceData.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="h-5 mt-1">
          {hoveredData ? (
            <div className="text-xs text-gray-400">
              {formatTimestamp(hoveredData.time)}
            </div>
          ) : lastFetchTime && (
            <div className="text-xs text-gray-500">
              Updated {lastFetchTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div 
        className="relative cursor-crosshair"
        style={{ height: `${chartHeight}px`, paddingLeft: '48px' }}
        onMouseMove={handleChartMouseMove}
        onMouseLeave={handleChartMouseLeave}
      >
        {/* Price labels */}
        <div className="absolute left-0 top-0 text-xs text-gray-500 z-10">
          ${priceRange.max.toFixed(2)}
        </div>
        <div className="absolute left-0 bottom-0 text-xs text-gray-500 z-10">
          ${priceRange.min.toFixed(2)}
        </div>
        
        <svg
          viewBox="0 0 100 40"
          className="w-full h-full"
          preserveAspectRatio="none"
          style={{ pointerEvents: 'none' }}
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#1e3a8a" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "#1e3a8a" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area under the line */}
          {chartPoints.length > 0 && (
            <motion.path
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              d={`${generatePath()} L 100,34 L 0,34 Z`}
              fill="url(#chartGradient)"
            />
          )}
          
          {/* Line */}
          {chartPoints.length > 0 && (
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              d={generatePath()}
              fill="none"
              stroke={isPositive ? "#1e3a8a" : "#ef4444"}
              strokeWidth="0.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Peak Price Markers */}
          {highPos && (
            <g>
              {/* High price marker */}
              <ellipse
                cx={highPos.x}
                cy={highPos.y}
                rx="1"
                ry="2"
                fill="#10b981"
                opacity="0.8"
              />
              {/* High price label */}
              <text
                x={highPos.x}
                y={highPos.y - 3}
                fontSize="3"
                fill="#10b981"
                textAnchor="middle"
                fontWeight="600"
              >
                ${highPos.price.toFixed(2)}
              </text>
            </g>
          )}
          
          {lowPos && (
            <g>
              {/* Low price marker */}
              <ellipse
                cx={lowPos.x}
                cy={lowPos.y}
                rx="1"
                ry="2"
                fill="#ef4444"
                opacity="0.8"
              />
              {/* Low price label */}
              <text
                x={lowPos.x}
                y={lowPos.y + 5}
                fontSize="3"
                fill="#ef4444"
                textAnchor="middle"
                fontWeight="600"
              >
                ${lowPos.price.toFixed(2)}
              </text>
            </g>
          )}
          
          {/* Hover indicator */}
          {hoveredData && (
            <>
              {/* Vertical line */}
              <line
                x1={hoveredData.x}
                y1="0"
                x2={hoveredData.x}
                y2="40"
                stroke="#fff"
                strokeWidth="0.5"
                strokeDasharray="1,1"
                opacity="0.5"
              />
              {/* Dot */}
              <ellipse
                cx={hoveredData.x}
                cy={(() => {
                  const verticalPadding = 6
                  const height = 40
                  const chartHeight = height - (verticalPadding * 2)
                  const max = Math.max(...chartPoints)
                  const min = Math.min(...chartPoints)
                  const range = max - min || 1
                  return height - verticalPadding - ((hoveredData.price - min) / range) * chartHeight
                })()}
                rx="0.9"
                ry="1.6"
                fill="#fff"
                stroke={isPositive ? "#1e3a8a" : "#ef4444"}
                strokeWidth="0.5"
              />
            </>
          )}
        </svg>
      </div>

      {/* Time Period Selector */}
      <div className="flex items-center justify-between border-t border-gray-700/50 pt-3">
        <div className="flex gap-2">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.label}
              onClick={() => setSelectedPeriod(period)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedPeriod.label === period.label
                  ? 'bg-primary-500/20 text-primary-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          Live
        </div>
      </div>
    </motion.div>
  )
}
