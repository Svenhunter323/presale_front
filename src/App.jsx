import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { config } from './lib/wagmi.js'
import { ToastProvider } from './components/Toasts.jsx'
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx'
import { AppRoutes } from './routes.jsx'
import './styles/globals.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30000, // 30 seconds
    },
  },
})

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <BrowserRouter>
            <ToastProvider>
              <div className="min-h-screen bg-[#0B0E13] text-zinc-200">
                <AppRoutes />
              </div>
            </ToastProvider>
          </BrowserRouter>
        </AdminAuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
