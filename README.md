# Token Presale Frontend

A production-ready React application for token presales on BNB Smart Chain, built with React 19, TailwindCSS, and Web3 integration using wagmi/viem/Web3Modal.

## Features

- 🚀 **Modern Stack**: React 19 + Vite + TailwindCSS
- 🔗 **Web3 Integration**: wagmi v2 + viem + Web3Modal
- 🌙 **Dark Theme**: Beautiful dark UI with responsive design
- 💰 **Multi-Payment**: Support for BNB and USDT payments
- 📊 **Stage-Based Pricing**: Dynamic pricing across multiple sale stages
- 🎯 **Referral System**: Built-in referral tracking and rewards
- 📧 **Email Capture**: Newsletter subscription with honeypot protection
- 🔄 **Real-time Updates**: Live progress tracking and countdown timers
- 📱 **Mobile Responsive**: Optimized for all device sizes
- ♿ **Accessible**: WCAG compliant with keyboard navigation
- 🔒 **Secure**: Environment-driven configuration and error handling

## Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` with your configuration:

```env
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Target Chain ID (56 for BSC mainnet, 97 for BSC testnet)
VITE_TARGET_CHAIN_ID=56

# Smart Contract Addresses
VITE_CONTRACT_ADDRESS=0x...
VITE_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955

# Explorer Configuration
VITE_EXPLORER_BASE=https://bscscan.com

# Public Base URL for referrals and social sharing
VITE_PUBLIC_BASE_URL=https://presale.example.com
```

### 3. Contract ABI

Place your PresaleStages contract ABI in `src/abi/PresaleStages.json`. The ABI should include all required functions:

- `status()`, `soldWave()`, `capWave()`, `startTs()`, `endTs()`, `unlockTs()`
- `stagesLength()`, `stages(uint256)`
- `softCapUsdtUnits()`, `raisedUsdtUnits()`
- `finalized()`, `successful()`, `refundsEnabled()`
- `purchasedWave(address)`, `claimedWave(address)`, `paidNative(address)`, `paidUSDT(address)`, `claimable(address)`
- `buyWithNative(address)`, `buyWithUSDT(uint256,address)`, `claim()`, `refund()`

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Network Configuration

### BSC Mainnet (Chain ID: 56)
- RPC: https://bsc-dataseed1.binance.org
- Explorer: https://bscscan.com
- USDT: 0x55d398326f99059fF775485246999027B3197955

### BSC Testnet (Chain ID: 97)
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545
- Explorer: https://testnet.bscscan.com
- USDT: Configure testnet USDT address

## Project Structure

```
src/
├── abi/
│   └── PresaleStages.json          # Contract ABI
├── lib/
│   ├── chains.js                   # Chain configurations
│   ├── wagmi.js                    # Wagmi setup and Web3Modal
│   ├── contract.js                 # Contract instances and helpers
│   ├── format.js                   # Formatting utilities
│   ├── errors.js                   # Error handling
│   └── api.js                      # Backend API client
├── hooks/
│   ├── useSaleReads.js            # Contract read operations
│   ├── useBuyNative.js            # BNB purchase flow
│   ├── useBuyUSDT.js              # USDT purchase flow
│   ├── useClaim.js                # Token claiming
│   ├── useRefund.js               # Refund processing
│   ├── useReferral.js             # Referral system
│   └── useCountdown.js            # Countdown timers
├── components/
│   ├── Header.jsx                 # App header with wallet connection
│   ├── StatusBar.jsx              # Sale status display
│   ├── ProgressBar.jsx            # Sale progress visualization
│   ├── StageBadge.jsx             # Current stage information
│   ├── BuyPanel.jsx               # Purchase interface
│   ├── ClaimPanel.jsx             # Token claiming interface
│   ├── RefundPanel.jsx            # Refund interface
│   ├── ReferralBox.jsx            # Referral link sharing
│   ├── EmailCapture.jsx           # Email subscription
│   ├── SocialShare.jsx            # Social media sharing
│   ├── SoftCapProgress.jsx        # Soft cap progress
│   ├── TermsCheckbox.jsx          # Terms acceptance
│   └── Toasts.jsx                 # Toast notifications
├── pages/
│   └── Home.jsx                   # Main application page
└── styles/
    └── globals.css                # Global styles and utilities
```

## Key Features Explained

### Stage-Based Pricing
The presale supports multiple stages with different prices and caps. The UI automatically:
- Displays current stage information
- Prevents purchases that exceed stage limits
- Shows stage progress and remaining tokens

### Multi-Currency Support
- **BNB**: Native currency payments
- **USDT**: ERC-20 token payments with approval flow
- Automatic decimal handling for different tokens
- Real-time balance and allowance checking

### Referral System
- URL-based referral tracking (`?ref=0x...`)
- Persistent referrer storage in sessionStorage
- Social sharing with UTM parameters
- Referral link generation for connected users

### Error Handling
- Contract error mapping to user-friendly messages
- Network error detection and recovery
- Transaction failure handling with retry options
- Input validation and sanitization

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Optimized for various screen sizes
- Dark theme with high contrast

## Backend Integration

The frontend expects these API endpoints:

```
POST /api/email/subscribe     # Email subscription
POST /api/referral           # Referral tracking
POST /api/log/tx             # Transaction logging
POST /api/geofence           # Geographic restrictions (optional)
```

## Security Considerations

- Environment variables for sensitive configuration
- Input validation and sanitization
- Honeypot protection for email capture
- Secure referral link validation
- Contract interaction safety checks

## Testing Checklist

### Wallet Connection
- [ ] MetaMask connection works on desktop
- [ ] WalletConnect works on mobile
- [ ] Chain switching functions correctly
- [ ] Wrong network detection and switching

### Purchase Flow
- [ ] BNB purchases complete successfully
- [ ] USDT approval and purchase flow works
- [ ] Stage limit validation prevents overflow
- [ ] Transaction toasts show correct BscScan links
- [ ] Progress bars update after purchases

### Claim/Refund
- [ ] Claim button appears after successful finalization
- [ ] Countdown shows correctly before unlock time
- [ ] Refund button appears after failed finalization
- [ ] User balances display correctly

### Referral System
- [ ] Referral links are generated correctly
- [ ] URL parameters are parsed and stored
- [ ] Social sharing includes referral links
- [ ] Copy functionality works

### UI/UX
- [ ] Responsive design works on mobile
- [ ] Dark theme is consistent
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Accessibility features work

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Configure environment variables** for production

3. **Deploy to your hosting platform** (Netlify, Vercel, etc.)

4. **Update VITE_PUBLIC_BASE_URL** to match your domain

5. **Test all functionality** on the live site

## Troubleshooting

### Common Issues

**"Contract not found" error**
- Verify VITE_CONTRACT_ADDRESS is correct
- Ensure you're on the right network
- Check that the contract is deployed

**"WalletConnect not working"**
- Verify VITE_WALLETCONNECT_PROJECT_ID is set
- Check that the project ID is valid
- Ensure the domain is allowlisted in WalletConnect dashboard

**"USDT approval fails"**
- Check VITE_USDT_ADDRESS is correct for your network
- Verify user has sufficient USDT balance
- Ensure gas fees are covered

**"Transactions fail"**
- Check if sale is active (status = 1)
- Verify purchase doesn't exceed stage limits
- Ensure sufficient gas fees

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect project ID |
| `VITE_TARGET_CHAIN_ID` | Yes | Target blockchain (56 or 97) |
| `VITE_CONTRACT_ADDRESS` | Yes | Presale contract address |
| `VITE_USDT_ADDRESS` | Yes | USDT token contract address |
| `VITE_EXPLORER_BASE` | No | Block explorer URL |
| `VITE_PUBLIC_BASE_URL` | No | Public URL for referrals |

## License

This project is proprietary. All rights reserved.

## Support

For technical support or questions, please contact the development team.
