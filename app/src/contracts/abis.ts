// Simplified ABIs for the contracts - in production, these would be imported from generated types
export const USDT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export const CUSDT_ABI = [
  "function wrap(address to, uint256 amount) external",
  "function unwrap(address to, uint256 amount) external", 
  "function underlying() external view returns (address)",
  "function confidentialBalanceOf(address account) external view returns (bytes32)",
  "function setOperator(address operator, uint256 until) external",
  "function isOperator(address account, address operator) external view returns (bool)",
  "function confidentialTransfer(address to, bytes32 encryptedAmount, bytes calldata inputProof) external",
  "function confidentialTransferFrom(address from, address to, bytes32 encryptedAmount, bytes calldata inputProof) external"
];

export const SECRET_PLATFORM_ABI = [
  "function deposit(bytes32 encryptedAmount, bytes calldata inputProof) external",
  "function withdrawAll() external",
  "function encryptedTransferTo(address to, bytes32 encryptedAmount, bytes calldata inputProof) external",
  "function encryptClaim() external",
  "function getBalance(address user) external view returns (bytes32)",
  "function getTransferRecord(address user) external view returns (bytes32)",
  "function approveTokenOperator(uint256 until) external",
  "function cUSDTToken() external view returns (address)"
];