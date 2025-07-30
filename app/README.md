# Secret Platform Frontend

A React-based frontend for the SecretPlatform confidential transfer system built with Zama FHE technology.

## Features

- **Wallet Connection**: Connect MetaMask wallet for blockchain interactions
- **USDT Management**: Claim test USDT tokens and wrap them to confidential cUSDT
- **Platform Operations**: Deposit/withdraw funds from the SecretPlatform
- **Secret Transfers**: Send confidential transfers that only recipients can decrypt
- **Balance Decryption**: Decrypt and view your encrypted balances
- **Transfer Claiming**: Claim secret transfers sent to your address

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Radix UI** for accessible components
- **Ethers.js** for blockchain interactions
- **Zama FHE Relayer SDK** for confidential computing
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- MetaMask browser extension
- Running local Hardhat network with deployed contracts

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Configuration

The frontend is configured to work with:
- **Local Hardhat Network** (Chain ID: 31337)
- **Localhost RPC**: http://127.0.0.1:8545

For production deployment, update the contract addresses in:
- `src/config/contracts.ts`

## Usage Guide

### 1. Connect Wallet
- Click "Connect MetaMask" to connect your wallet
- Make sure you're connected to the correct network (localhost:8545)

### 2. Get Test Tokens
- Go to "USDT Manager"
- Enter amount and click "Claim USDT" to mint test tokens
- Wrap USDT to cUSDT for confidential operations

### 3. Use the Platform
- Go to "Platform" section
- Approve the platform to manage your cUSDT tokens
- Deposit cUSDT to start using confidential features

### 4. Send Secret Transfers
- Go to "Secret Transfer"
- Enter recipient address and amount
- The transfer amount will be encrypted and only the recipient can claim it

### 5. Check Balances
- Go to "Balance Checker"
- Load your encrypted balances from contracts
- Decrypt them to see actual amounts (requires signature)

### 6. Claim Transfers
- Go to "Claim Transfers"
- Check if anyone has sent you transfers
- Claim any pending transfers to add to your platform balance

## Architecture

### Context Providers
- **WalletContext**: Manages wallet connection and signer
- **FHEVMContext**: Handles FHEVM instance and FHE operations

### Contract Services
- **ContractService**: Wraps contract interactions with error handling
- Supports all platform operations: deposit, withdraw, transfer, claim

### UI Components
- Modular components for each major feature
- Consistent design with Tailwind CSS
- Toast notifications for user feedback
- Responsive design for mobile and desktop

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file for production configuration:

```bash
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
VITE_USDT_ADDRESS=0x...
VITE_CUSDT_ADDRESS=0x...
VITE_PLATFORM_ADDRESS=0x...
```

## Security Considerations

- All sensitive operations require user wallet signatures
- Encrypted data never leaves encrypted form on-chain
- FHE computations are performed by Zama's decentralized network
- No private keys or sensitive data stored in frontend

## Troubleshooting

### Common Issues

1. **"Cannot resolve 'tfhe_bg.wasm'"**
   - This is handled by the Vite configuration
   - The WASM files are loaded via CDN

2. **"Buffer is not defined"**
   - Handled by polyfills in `main.tsx`
   - Buffer is made available globally

3. **Network Connection Issues**
   - Ensure Hardhat network is running on port 8545
   - Check MetaMask is connected to localhost network

4. **Contract Interaction Failures**
   - Verify contracts are deployed to the local network
   - Check contract addresses in `src/config/contracts.ts`
   - Ensure wallet has sufficient gas and token balances

### Getting Help

- Check browser console for detailed error messages
- Verify network connection and contract deployments
- Ensure all dependencies are properly installed

## License

This project is part of the Secret Platform and follows the same license terms.