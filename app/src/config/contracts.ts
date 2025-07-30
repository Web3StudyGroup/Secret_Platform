// Contract addresses - these would normally come from deployment files or environment variables
export const CONTRACT_ADDRESSES = {
  USDT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  cUSDT: "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc", 
  SecretPlatform: "0x51A1ceB83B83F1985a81C295d1fF28Afef186E02"
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // localhost hardhat
  name: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545"
};

// For Sepolia testnet, use these addresses:
export const SEPOLIA_ADDRESSES = {
  // These would be filled with actual deployed contract addresses on Sepolia
  USDT: "",
  cUSDT: "",
  SecretPlatform: ""
};

export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_API_KEY"
};