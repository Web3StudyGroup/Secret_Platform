import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;

  const { deployer } = await getNamedAccounts();

  let wrappedTokenAddress: string;

  // Get the wrapped token address based on network
  // if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
  // Use Mock USDT for local development
  const mockUSDT = await get("MockERC20");
  wrappedTokenAddress = mockUSDT.address;
  // } else if (hre.network.name === "sepolia") {
  //   // Use real USDT address on Sepolia testnet
  //   // Note: This should be the actual USDT contract address on Sepolia
  //   wrappedTokenAddress = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; // Example USDT address on Sepolia
  // } else {
  //   throw new Error(`Unsupported network: ${hre.network.name}`);
  // }

  // Deploy cUSDT with IERC20 parameter
  const cUSDT = await deploy("cUSDT", {
    from: deployer,
    args: [wrappedTokenAddress],
    log: true,
    deterministicDeployment: false,
  });

  console.log(`cUSDT deployed to: ${cUSDT.address}`);
  console.log(`Wrapped token: ${wrappedTokenAddress}`);
};

export default func;
func.tags = ["cusdt"];
func.dependencies = ["MockUSDT"];