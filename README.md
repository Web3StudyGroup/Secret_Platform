# SecretPlatform - Confidential Transfer Platform

A decentralized platform that enables users to store encrypted cUSDT tokens and perform confidential transfers using Zama's Fully Homomorphic Encryption (FHE) technology.

## 🔒 Core Features

SecretPlatform provides a complete confidential transaction ecosystem with the following capabilities:

### ✅ Confidential Token Management
- **cUSDT Token**: Custom implementation of confidential USDT with wrap/unwrap functionality
- **Encrypted Balances**: All user balances are stored and processed in encrypted form
- **Confidential Transfers**: Support for encrypted transfer and transferFrom operations

### ✅ Platform Operations
- **Encrypted Deposits**: Users can deposit cUSDT with encrypted amounts
- **Encrypted Withdrawals**: Withdraw any encrypted amount from platform balance
- **Secret Transfers**: Transfer encrypted amounts to encrypted addresses
- **Claim System**: Recipients can claim transfers using encrypted claim mechanism

## 🏗️ Architecture Overview

### Smart Contracts

#### cUSDT Contract (`cUSDT.sol`)
- **Purpose**: Confidential USDT token implementation
- **Base**: Extends `ConfidentialFungibleTokenERC20Wrapper` from OpenZeppelin Confidential Contracts
- **Key Features**:
  - Wrap/unwrap regular USDT to confidential cUSDT
  - Full confidential ERC20 interface with encrypted transfer methods
  - 6-decimal precision for USDT compatibility
  - ACL (Access Control List) integration for permission management

#### SecretPlatform Contract (`SecretPlatform.sol`)
- **Purpose**: Main platform contract managing user balances and transfers
- **Key Components**:
  - `userBalances`: Encrypted balance mapping for platform users
  - `transferRecords`: Storage for pending encrypted transfers
  - `transferExists`: Boolean flags for transfer record existence
- **Core Functions**:
  - `deposit()`: Deposit cUSDT to platform with encrypted amounts
  - `withdraw()` / `withdrawAll()`: Withdraw encrypted amounts from platform
  - `encryptedTransferTo()`: Create encrypted transfers to specified addresses
  - `encryptClaim()`: Claim pending encrypted transfers

### Technology Stack

- **Framework**: Hardhat development environment
- **Encryption**: Zama FHE (Fully Homomorphic Encryption)
  - Supports encrypted operations without decryption
  - Maintains privacy throughout transaction lifecycle
- **Base Contracts**: OpenZeppelin Confidential Contracts
- **Network**: Ethereum Sepolia Testnet with FHE support
- **Frontend**: React with TypeScript and Zama SDK integration

## 🚀 Implementation Status

### ✅ Completed Components

| Component | Status | Description |
|-----------|--------|-------------|
| **cUSDT Contract** | ✅ Complete | Custom confidential token with wrapper functionality |
| **SecretPlatform Contract** | ✅ Complete | All core platform features implemented |
| **Frontend Application** | ✅ Complete | Full Web interface in `/app` directory |
| **Test Suite** | ✅ Complete | Contract functionality tests |
| **Deployment Scripts** | ✅ Complete | Automated deployment to testnet |

### 🔧 Key Implementation Details

- **No OpenZeppelin Dependency**: Custom implementation instead of relying on `ConfidentialFungibleTokenERC20Wrapper`
- **ACL Integration**: Proper access control list management for encrypted data
- **Error Handling**: Comprehensive error tracking for confidential operations
- **Gas Optimization**: Efficient FHE operations and minimal on-chain storage

## 📁 Project Structure

```
Secret_Platform/
├── contracts/              # Smart contract source files
│   ├── cUSDT.sol           # Confidential USDT token implementation
│   ├── SecretPlatform.sol  # Main platform contract
│   ├── MockERC20.sol       # Mock USDT for testing
│   └── FHECounter.sol      # Example FHE contract
├── app/                    # Frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Wallet, ZamaSDK)
│   │   └── contracts/      # Contract ABIs and configurations
│   └── package.json
├── deploy/                 # Deployment scripts
├── test/                   # Test files
├── docs/                   # Zama documentation
└── hardhat.config.ts       # Hardhat configuration
```

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: Version 20 or higher
- **npm/yarn/pnpm**: Package manager
- **Wallet**: MetaMask or compatible Web3 wallet

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository>
   cd Secret_Platform
   npm install
   ```

2. **Set up environment variables**
   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

3. **Compile contracts**
   ```bash
   npm run compile
   ```

4. **Run tests**
   ```bash
   npm run test
   ```

5. **Deploy to Sepolia Testnet**
   ```bash
   npx hardhat deploy --network sepolia
   ```

### Frontend Setup

1. **Navigate to app directory**
   ```bash
   cd app
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Security Features

- **End-to-End Encryption**: All sensitive data encrypted using Zama FHE
- **Access Control**: Comprehensive ACL system for encrypted data access
- **No Plaintext Exposure**: Amounts and balances never exposed on-chain
- **Operator Pattern**: Secure delegation system for token operations
- **Input Validation**: Cryptographic proofs for all encrypted inputs

## 📋 Usage Example

```solidity
// Deploy cUSDT with underlying USDT
cUSDT cusdt = new cUSDT(IERC20(usdtAddress));

// Deploy SecretPlatform
SecretPlatform platform = new SecretPlatform(address(cusdt));

// User deposits encrypted amount
platform.deposit(encryptedAmount, inputProof);

// User creates encrypted transfer
platform.encryptedTransferTo(recipient, encryptedAmount, inputProof);

// Recipient claims transfer
platform.encryptClaim();
```

## 🌐 Network Configuration

### Sepolia Testnet
- **Network ID**: 11155111
- **FHEVM Gateway ID**: 55815
- **Relayer URL**: https://relayer.testnet.zama.cloud

### Contract Addresses (Sepolia)
- **FHE Executor**: `0x848B0066793BcC60346Da1F49049357399B8D595`
- **ACL Contract**: `0x687820221192C5B662b25367F70076A37bc79b6c`
- **KMS Verifier**: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`

## 📚 Documentation

- **Zama FHE Documentation**: [docs/zama_llm.md](docs/zama_llm.md)
- **Zama Relayer SDK**: [docs/zama_doc_relayer.md](docs/zama_doc_relayer.md)
- **FHEVM Protocol**: https://docs.zama.ai/fhevm
- **OpenZeppelin Confidential**: https://docs.openzeppelin.com/contracts-cairo

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **GitHub Issues**: Report bugs or request features
- **Zama Community**: [Community Forum](https://community.zama.ai)
- **Discord**: [Zama Discord](https://discord.gg/zama)

---

**Built with ❤️ using Zama FHE Technology**