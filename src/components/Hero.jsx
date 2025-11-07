import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Users, Shield } from 'lucide-react'
import heroImage from '../assets/hero.png'
import { BNBPriceChart } from './BNBPriceChart.jsx'

export const Hero = () => {
  return (
    <div className="relative overflow-hidden py-10 px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-primary-500 bg-clip-text text-transparent animate-gradient">
                $WAVE Presale
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Join the future of decentralized finance. Secure your WAVE tokens at exclusive presale prices.
            </motion.p>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0"
            >
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-primary-500/50 transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-primary-400 mb-2" />
                <div className="text-2xl font-bold text-white">$2M+</div>
                <div className="text-xs text-gray-400">Raised</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-primary-500/50 transition-all duration-300">
                <Users className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-xs text-gray-400">Holders</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 hover:border-primary-500/50 transition-all duration-300">
                <Shield className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-gray-400">Secure</div>
              </div>
            </motion.div>
            
            {/* BNB Price Chart */}
            <BNBPriceChart />
          </motion.div>

          {/* Right Content - Animated Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse-slow" />
              
              {/* Image Container */}
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <div className="relative rounded-2xl overflow-hidden">
                  <img 
                    src={heroImage} 
                    alt="WAVE Token" 
                    className="w-auto h-auto object-cover"
                  />
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500/20 rounded-full blur-xl"
              />
              <motion.div
                animate={{ 
                  rotate: -360,
                }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
