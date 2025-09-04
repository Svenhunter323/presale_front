import { Toaster, toast } from 'sonner'

export const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'white'
          }
        }}
      />
    </>
  )
}

// Compatibility hook for existing components
export const useToast = () => {
  return {
    success: (message, options = {}) => toast.success(message, options),
    error: (message, options = {}) => toast.error(message, options),
    info: (message, options = {}) => toast.info(message, options),
    warning: (message, options = {}) => toast.warning(message, options),
    loading: (message, options = {}) => toast.loading(message, options),
    dismiss: (id) => toast.dismiss(id)
  }
}
