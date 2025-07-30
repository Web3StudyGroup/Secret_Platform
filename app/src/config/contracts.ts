// Contract addresses - for local development
export const LOCAL_ADDRESSES = {
  USDT: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  cUSDT: "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc", 
  SecretPlatform: "0x51A1ceB83B83F1985a81C295d1fF28Afef186E02"
};

// Sepolia testnet deployed addresses
export const SEPOLIA_ADDRESSES = {
  USDT: "0xdd30D7b1b2aB6009722a6042278c64aAc1e452B2",
  cUSDT: "0x2818387330c2A94b14F45F86c3CC41ef93807b8b",
  SecretPlatform: "0xD17C0DC263810531781E1b26c30e8143E86055a8"
};

// Current active addresses (change this to switch networks)
export const CONTRACT_ADDRESSES = SEPOLIA_ADDRESSES;

// Network configurations
export const LOCAL_CONFIG = {
  chainId: 31337,
  name: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545"
};

export const SEPOLIA_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/"
};

// Current active network config
export const NETWORK_CONFIG = SEPOLIA_CONFIG;