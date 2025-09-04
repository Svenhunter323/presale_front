// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { 
  Settings, 
  Shield, 
  LogOut,
  AlertTriangle 
} from 'lucide-react'
import { AdminLoginDialog } from '../components/AdminLoginDialog.jsx'
import { useAdminAuth } from '../hooks/useAdminAuth.js'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { OverviewSection } from '../components/admin/OverviewSection.jsx'
import { StagesSection } from '../components/admin/StagesSection.jsx'
import { LimitsSection } from '../components/admin/LimitsSection.jsx'
import { TimesSection } from '../components/admin/TimesSection.jsx'
import { WithdrawalsSection } from '../components/admin/WithdrawalsSection.jsx'

export function Admin() {
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { isAuthenticated, logout } = useAdminAuth()
  const { address, isConnected } = useAccount()


  // Show login dialog on mount if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginDialog(true)
    }

    console.log("isAuthenticated----------->",isAuthenticated)
  }, [isAuthenticated])

  const handleAuthSuccess = () => {
    setShowLoginDialog(false)
  }

  const handleLogout = () => {
    logout()
    setShowLoginDialog(true)
  }

  const isOwnerConnected = isConnected && address

  return (
    <div className="min-h-screen bg-[#0B0E13] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-white/10 bg-[#0B0E13]/80 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 rounded-xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">WAVE Presale Admin</h1>
                  <p className="text-sm text-zinc-400">Control Panel</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isAuthenticated && (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="success">
                        <Shield className="w-3 h-3 mr-1" />
                        Authenticated
                      </Badge>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isAuthenticated ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Read-only Warning */}
              {!isOwnerConnected && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-blue-400 font-medium">Read-Only Mode</p>
                      <p className="text-blue-300/80 text-sm">
                        Connect the owner wallet to perform admin actions. Currently viewing in read-only mode.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Admin Tabs */}
              <Tabs defaultValue="overview">
                {({ activeTab, setActiveTab }) => (
                  <>
                    <TabsList className="mb-8">
                      <TabsTrigger value="overview" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="stages" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Stages
                      </TabsTrigger>
                      <TabsTrigger value="limits" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Limits
                      </TabsTrigger>
                      <TabsTrigger value="times" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Times
                      </TabsTrigger>
                      <TabsTrigger value="withdrawals" activeTab={activeTab} setActiveTab={setActiveTab}>
                        Withdrawals
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" activeTab={activeTab}>
                      <OverviewSection isOwner={isOwnerConnected} />
                    </TabsContent>

                    <TabsContent value="stages" activeTab={activeTab}>
                      <StagesSection isOwner={isOwnerConnected} />
                    </TabsContent>

                    <TabsContent value="limits" activeTab={activeTab}>
                      <LimitsSection isOwner={isOwnerConnected} />
                    </TabsContent>

                    <TabsContent value="times" activeTab={activeTab}>
                      <TimesSection isOwner={isOwnerConnected} />
                    </TabsContent>

                    <TabsContent value="withdrawals" activeTab={activeTab}>
                      <WithdrawalsSection isOwner={isOwnerConnected} />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="p-4 bg-gradient-to-r from-teal-400/20 via-cyan-400/20 to-indigo-400/20 rounded-full w-20 h-20 mx-auto mb-6">
                <Shield className="w-12 h-12 text-white mx-auto mt-2" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Access Required</h2>
              <p className="text-zinc-400 mb-6">
                Authenticate to access the admin control panel
              </p>
              <div className="flex justify-center">
                <Button className="rounded-2xl" onClick={() => setShowLoginDialog(true)}>
                  Login
                </Button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Login Dialog */}
      <AdminLoginDialog
        open={showLoginDialog}
        onClose={() => !isAuthenticated && setShowLoginDialog(false)} // Prevent closing if not authenticated
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
