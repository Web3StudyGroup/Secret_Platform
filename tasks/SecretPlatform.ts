import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("claim-usdt", "Claim usdt")
  .addParam("usdt", "Address of usdt")
  .addParam("amount", "Amount")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const amount = ethers.parseUnits(taskArguments.amount, 6);

    console.log("🔄 Claim USDT...");
    console.log("Amount:", taskArguments.amount, "USDT");
    // mint(address to, uint256 amount)
    const USDT = await ethers.getContractAt("MockERC20", taskArguments.usdt);
    const approveTx = await USDT.mint(signer.address, amount);
    await approveTx.wait();
    console.log("✅ claim confirmed");
  })

// Task: Wrap USDT to cUSDT
task("wrap-usdt", "Wrap USDT tokens to cUSDT")
  .addParam("cusdt", "Address of the cUSDT contract")
  .addParam("amount", "Amount of USDT to wrap")
  .addOptionalParam("to", "Address to receive cUSDT (defaults to sender)")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const to = taskArguments.to || signer.address;
    const amount = ethers.parseUnits(taskArguments.amount, 6);

    console.log("🔄 Wrapping USDT to cUSDT...");
    console.log("Amount:", taskArguments.amount, "USDT");
    console.log("To:", to);

    const cUSDT = await ethers.getContractAt("cUSDT", taskArguments.cusdt);
    const underlyingAddress = await cUSDT.underlying();
    const underlying = await ethers.getContractAt("IERC20", underlyingAddress);

    // Check and approve if needed
    const allowance = await underlying.allowance(signer.address, taskArguments.cusdt);
    if (allowance < amount) {
      console.log("📝 Approving USDT spending...");
      const approveTx = await underlying.approve(taskArguments.cusdt, amount);
      await approveTx.wait();
      console.log("✅ Approval confirmed");
    }

    // Wrap tokens
    const wrapTx = await cUSDT.wrap(to, amount);
    await wrapTx.wait();

    console.log("✅ Wrapped", taskArguments.amount, "USDT to cUSDT");
    console.log("Transaction:", wrapTx.hash);
  });

/**
 * Check confidential token balance
 * Example: npx hardhat --network localhost task:check-balance --confidential-token 0x123... --user 0
 */
task("check-balance", "Check encrypted balance of a confidential token")
  .addParam("cftoken", "The address of the confidential token")
  .addOptionalParam("user", "User index (default: 0)", "0")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const confidentialTokenAddress = taskArguments.cftoken;
    const userIndex = parseInt(taskArguments.user);

    if (!confidentialTokenAddress) {
      throw new Error("--confidential-token parameter is required");
    }

    const signers = await ethers.getSigners();
    const user = signers[userIndex];

    console.log(`Checking balance for user: ${user.address}`);
    console.log(`Confidential token: ${confidentialTokenAddress}`);

    try {
      const confidentialToken = await ethers.getContractAt("cUSDT", confidentialTokenAddress);

      // Get encrypted balance
      const encryptedBalance = await confidentialToken.confidentialBalanceOf(user.address);
      console.log(`Encrypted balance handle: ${encryptedBalance}`);

      // Decrypt balance (user needs permission)
      try {
        const clearBalance = await fhevm.userDecryptEuint(
          FhevmType.euint64,
          encryptedBalance,
          confidentialTokenAddress,
          user
        );
        console.log(`Decrypted balance: ${clearBalance}`);
      } catch (decryptError) {
        console.log(`Could not decrypt balance (user may not have permission): ${decryptError}`);
      }

    } catch (error) {
      console.error(`Error checking balance: ${error}`);
      throw error;
    }
  });

// Task: Set operator for cUSDT transfers
task("approve-platform", "Approve SecretPlatform as operator for cUSDT")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("cusdt", "Address of the cUSDT contract")
  .addOptionalParam("duration", "Duration in seconds (default: 1 year)", "31536000")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const cUSDT = await ethers.getContractAt("cUSDT", taskArguments.cusdt);

    const until = Math.floor(Date.now() / 1000) + parseInt(taskArguments.duration);

    console.log("🔐 Approving platform as operator...");
    console.log("Platform:", taskArguments.platform);
    console.log("cUSDT:", taskArguments.cusdt);
    console.log("Valid until:", new Date(until * 1000).toISOString());

    // User directly calls setOperator on cUSDT contract
    const approveTx = await cUSDT.setOperator(taskArguments.platform, until);
    await approveTx.wait();

    console.log("✅ Platform approved as operator");
    console.log("Transaction:", approveTx.hash);
  });

// Task: Deposit cUSDT to platform
task("deposit", "Deposit cUSDT to SecretPlatform")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("amount", "Amount to deposit")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const [signer] = await ethers.getSigners();
    console.log("signer:", signer.address);

    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    // const amount = BigInt(taskArguments.amount);
    const amount = parseInt(taskArguments.amount) * 1000000
    await fhevm.initializeCLIApi();
    console.log("💰 Depositing to SecretPlatform...");
    console.log("Amount:", amount);

    // Create encrypted input using hre.fhevm

    const input = fhevm.createEncryptedInput(taskArguments.platform, signer.address);
    input.add64(amount);
    const encryptedInput = await input.encrypt();

    const depositTx = await platform.deposit(
      encryptedInput.handles[0],
      encryptedInput.inputProof
    );
    await depositTx.wait();

    console.log("✅ Deposit successful");
    console.log("Transaction:", depositTx.hash);
  });

// Task: Create encrypted transfer
task("secret-transfer", "Create encrypted transfer to another address")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("to", "Recipient address")
  .addParam("amount", "Amount to transfer")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const signers = await ethers.getSigners();
    const signer = signers[0]
    const to = signers[parseInt(taskArguments.to)]
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const amount = BigInt(taskArguments.amount);

    console.log("🔐 Creating secret transfer...");
    console.log("To:", taskArguments.to);
    console.log("Amount:", taskArguments.amount);

    // Create encrypted input using hre.fhevm

    const input = fhevm.createEncryptedInput(taskArguments.platform, signer.address);
    input.add64(amount);
    const encryptedInput = await input.encrypt();

    const transferTx = await platform.encryptedTransferTo(
      to,
      encryptedInput.handles[0],
      encryptedInput.inputProof
    );
    await transferTx.wait();

    console.log("✅ Secret transfer created");
    console.log("Transaction:", transferTx.hash);
    console.log("💡 Recipient can now claim with: npx hardhat claim --platform", taskArguments.platform, "--from", signer.address);
  });

// Task: Claim transfer
task("claim", "Claim a transfer sent to you")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("user", "Address that sent the transfer")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const signer = signers[parseInt(taskArguments.user)]
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);

    console.log("💸 Claiming transfer...");
    console.log("From:", taskArguments.from);
    console.log("To:", signer.address);

    // Check if transfer record exists
    const transferRecord = await platform.getTransferRecord(signer.address);
    console.log("transferRecord:", transferRecord);

    // if (!hasTransfer) {
    //   console.log("❌ No transfer record found from", taskArguments.from);
    //   return;
    // }

    const claimTx = await platform.connect(signer).encryptClaim();
    await claimTx.wait();

    console.log("✅ Transfer claimed successfully");
    console.log("Transaction:", claimTx.hash);
  });

// Task: Claim transfer
task("withdrawall", "Claim a transfer sent to you")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("user", "Address that sent the transfer")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const signers = await ethers.getSigners();
    const signer = signers[parseInt(taskArguments.user)]
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);

    console.log("💸 Claiming transfer...");
    console.log("From:", taskArguments.from);
    console.log("To:", signer.address);

    // Check if transfer record exists
    // const transferRecord = await platform.getTransferRecord(signer.address);
    // console.log("transferRecord:", transferRecord);
    const tx = await platform.connect(signer).withdrawAll()
    await tx.wait()


    // if (!hasTransfer) {
    //   console.log("❌ No transfer record found from", taskArguments.from);
    //   return;
    // }

    const claimTx = await platform.connect(signer).encryptClaim();
    await claimTx.wait();

    console.log("✅ Transfer claimed successfully");
    console.log("Transaction:", claimTx.hash);
  });

// Task: Get platform balance (encrypted)
task("balance", "Get encrypted balance on SecretPlatform")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addOptionalParam("user", "User address (defaults to signer)")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const user = taskArguments.user || signer.address;
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);

    console.log("📊 Getting platform balance...");
    console.log("User:", user);

    const encryptedBalance = await platform.getBalance(user);

    console.log("🔐 Encrypted balance handle:", encryptedBalance);
    console.log("💡 Use user decryption to see the actual balance");
  });

// Task: Diagnose contract state
task("diagnose", "Diagnose contract state for debugging")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("cusdt", "Address of the cUSDT contract")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const cUSDT = await ethers.getContractAt("cUSDT", taskArguments.cusdt);
    const underlying = await ethers.getContractAt("IERC20", await cUSDT.underlying());

    console.log("🔍 Diagnosing contract state...");
    console.log("User:", signer.address);
    console.log("Platform:", taskArguments.platform);
    console.log("cUSDT:", taskArguments.cusdt);

    try {
      // Check underlying USDT balance
      const underlyingBalance = await underlying.balanceOf(signer.address);
      console.log("📊 Underlying USDT balance:", ethers.formatUnits(underlyingBalance, 6));

      // Check if platform is operator
      const isOperator = await cUSDT.isOperator(signer.address, taskArguments.platform);
      console.log("🔐 Is platform operator?", isOperator);

      // Check cUSDT balance (this might fail if balance is encrypted)
      try {
        const cUSDTBalance = await cUSDT.confidentialBalanceOf(signer.address);
        console.log("💰 cUSDT balance handle:", cUSDTBalance);
      } catch (e) {
        console.log("⚠️ Cannot read cUSDT balance (encrypted)");
      }

      // Check platform balance
      try {
        const platformBalance = await platform.getBalance(signer.address);
        console.log("🏛️ Platform balance handle:", platformBalance);
      } catch (e) {
        console.log("⚠️ Cannot read platform balance:", e.message);
      }

    } catch (error) {
      console.error("❌ Error during diagnosis:", error.message);
    }
  });

// Task: Complete workflow demo
task("demo", "Run a complete SecretPlatform demo")
  .addOptionalParam("users", "Number of users for demo", "2")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm, run } = hre;
    await fhevm.initializeCLIApi();
    const users = parseInt(taskArguments.users);
    console.log("🎭 Starting SecretPlatform Demo with", users, "users");

    // Deploy system
    console.log("\n=== DEPLOYMENT ===");
    const contracts = await run("deploy-secret-platform");

    // Setup users
    const signers = await ethers.getSigners();
    const userSigners = signers.slice(0, users);

    console.log("\n=== USER SETUP ===");
    for (let i = 0; i < userSigners.length; i++) {
      const user = userSigners[i];
      console.log(`👤 User ${i + 1}:`, user.address);

      // Mint USDT to user
      const usdt = await ethers.getContractAt("MockERC20", contracts.usdt);
      await usdt.mint(user.address, ethers.parseUnits("1000", 6));

      // Wrap to cUSDT
      await usdt.connect(user).approve(contracts.cUSDT, ethers.parseUnits("500", 6));
      const cUSDT = await ethers.getContractAt("cUSDT", contracts.cUSDT);
      await cUSDT.connect(user).wrap(user.address, ethers.parseUnits("500", 6));

      // Approve platform
      const platform = await ethers.getContractAt("SecretPlatform", contracts.platform);
      const until = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      await platform.connect(user).approveTokenOperator(until);

      console.log(`✅ User ${i + 1} setup complete`);
    }

    console.log("\n=== TRANSACTIONS ===");
    const platform = await ethers.getContractAt("SecretPlatform", contracts.platform);

    // User 1 deposits 100
    console.log("💰 User 1 deposits 100 cUSDT");

    let input = fhevm.createEncryptedInput(contracts.platform, userSigners[0].address);
    input.add64(100n);
    let encryptedInput = await input.encrypt();
    await platform.connect(userSigners[0]).deposit(encryptedInput.handles[0], encryptedInput.inputProof);

    if (users > 1) {
      // User 2 deposits 200
      console.log("💰 User 2 deposits 200 cUSDT");
      input = fhevm.createEncryptedInput(contracts.platform, userSigners[1].address);
      input.add64(200n);
      encryptedInput = await input.encrypt();
      await platform.connect(userSigners[1]).deposit(encryptedInput.handles[0], encryptedInput.inputProof);

      // User 1 sends 50 to User 2
      console.log("🔐 User 1 sends secret transfer of 50 to User 2");
      input = fhevm.createEncryptedInput(contracts.platform, userSigners[0].address);
      input.add64(50n);
      encryptedInput = await input.encrypt();
      await platform.connect(userSigners[0]).encryptedTransferTo(
        userSigners[1].address,
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );

      // User 2 claims the transfer
      console.log("💸 User 2 claims the transfer from User 1");
      await platform.connect(userSigners[1]).encryptClaim();
    }

    console.log("\n🎉 Demo completed successfully!");
    console.log("📋 Contract addresses:");
    console.log("  USDT:", contracts.usdt);
    console.log("  cUSDT:", contracts.cUSDT);
    console.log("  Platform:", contracts.platform);
  });

export default {};