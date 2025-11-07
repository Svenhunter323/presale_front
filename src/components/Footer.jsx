import { motion } from 'framer-motion'
import { Twitter, Send, Github, Globe, Mail, Shield, FileText, ExternalLink } from 'lucide-react'
import { PRESALE_CONTRACT_ADDRESS } from '../lib/contract.js'
import { getAddressUrl } from '../lib/chains.js'
import { shortenAddress } from '../lib/format.js'
import heroImage from '../assets/hero.png'

export const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:text-blue-400' },
    { icon: Send, label: 'Telegram', href: '#', color: 'hover:text-cyan-400' },
    { icon: Github, label: 'Github', href: '#', color: 'hover:text-purple-400' },
    { icon: Globe, label: 'Website', href: '#', color: 'hover:text-green-400' },
  ]

  const quickLinks = [
    { label: 'How to Buy', href: '#buy' },
    { label: 'Tokenomics', href: '#tokenomics' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Team', href: '#team' },
  ]

  const legalLinks = [
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Disclaimer', href: '#disclaimer' },
    { label: 'Audit Report', href: '#audit' },
  ]

  return (
    <footer className="relative mt-20 border-t border-gray-800/50 backdrop-blur-sm bg-gray-900/30">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center mb-4">
              <img 
                src={heroImage} 
                alt="WAVE" 
                className="w-10 h-10 mr-3 rounded-full object-cover"
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                WAVE Token
              </h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The next generation blockchain presale platform. Secure, transparent, and decentralized.
            </p>
            
            {/* Contract Address */}
            {PRESALE_CONTRACT_ADDRESS && (
              <div className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                <Shield className="w-3 h-3" />
                <a
                  href={getAddressUrl(PRESALE_CONTRACT_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  {shortenAddress(PRESALE_CONTRACT_ADDRESS)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary-400" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary-400 transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary-400" />
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-primary-400 transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Mail className="w-4 h-4 mr-2 text-primary-400" />
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-3 mb-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800/50 rounded-lg border border-gray-700/50 ${social.color} transition-all duration-300 hover:scale-110 hover:bg-gray-700/50`}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
            <p className="text-gray-400 text-xs">
              Join our community and stay updated with the latest news and announcements.
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-gray-800/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © {currentYear} WAVE Token. All rights reserved.
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Smart Contract Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="w-3 h-3 text-green-500" />
                <span>Audited by CertiK</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg"
        >
          <p className="text-yellow-200/70 text-xs text-center leading-relaxed">
            <strong className="text-yellow-200">Risk Warning:</strong> Cryptocurrency investments carry significant risk. 
            Please conduct your own research and only invest what you can afford to lose. 
            This is not financial advice. WAVE Token is not available to residents of certain jurisdictions.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
