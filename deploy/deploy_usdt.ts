import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  // Deploy Mock USDT for testing (only on local networks)
  // if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
  await deploy("MockERC20", {
    from: deployer,
    args: ["Mock USDT", "USDT", 6],
    log: true,
    deterministicDeployment: false,
  });
  // }
};

export default func;
func.tags = ["usdt"];