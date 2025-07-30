import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;

  const { deployer } = await getNamedAccounts();

  // Get cUSDT contract address
  const cUSDT = await get("cUSDT");

  // Deploy SecretPlatform
  const secretPlatform = await deploy("SecretPlatform", {
    from: deployer,
    args: [cUSDT.address],
    log: true,
    deterministicDeployment: false,
  });

  console.log(`SecretPlatform deployed to: ${secretPlatform.address}`);
  console.log(`cUSDT token: ${cUSDT.address}`);

  // Log deployment summary
  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Deployer: ${deployer}`);
  console.log(`SecretPlatform: ${secretPlatform.address}`);
  console.log(`cUSDT: ${cUSDT.address}`);
  
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    const mockUSDT = await get("MockERC20");
    console.log(`Mock USDT: ${mockUSDT.address}`);
  }
  
  console.log("========================\n");
};

export default func;
func.tags = ["platform"];
func.dependencies = ["cUSDT"];