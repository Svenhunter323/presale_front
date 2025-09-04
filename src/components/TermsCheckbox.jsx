import { clsx } from 'clsx'

export const TermsCheckbox = ({ checked, onChange, className }) => {
  return (
    <div className={clsx('flex items-start space-x-3', className)}>
      <input
        type="checkbox"
        id="terms-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 text-primary-600 bg-gray-800 border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
      />
      <label htmlFor="terms-checkbox" className="text-sm text-gray-300 cursor-pointer">
        I have read and agree to the{' '}
        <a 
          href="#terms" 
          className="text-primary-400 hover:text-primary-300 underline"
          onClick={(e) => {
            e.preventDefault()
            // You can implement a modal or redirect to terms page here
            console.log('Terms and conditions clicked')
          }}
        >
          Terms and Conditions
        </a>
        {' '}and{' '}
        <a 
          href="#privacy" 
          className="text-primary-400 hover:text-primary-300 underline"
          onClick={(e) => {
            e.preventDefault()
            // You can implement a modal or redirect to privacy page here
            console.log('Privacy policy clicked')
          }}
        >
          Privacy Policy
        </a>
        . I understand the risks associated with cryptocurrency investments and token purchases.
      </label>
    </div>
  )
}
