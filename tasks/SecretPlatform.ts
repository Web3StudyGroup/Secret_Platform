import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

// Task: Deploy complete SecretPlatform system
task("deploy-secret-platform", "Deploy the complete SecretPlatform system")
  .addOptionalParam("usdt", "Address of the USDT token to wrap", "")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    const { deployer } = await ethers.getNamedSigners();
    
    console.log("🚀 Deploying SecretPlatform system...");
    console.log("Deployer:", deployer.address);
    
    let usdtAddress = taskArguments.usdt;
    
    // Deploy MockERC20 if no USDT address provided
    if (!usdtAddress) {
      console.log("📝 Deploying MockUSDT...");
      const MockUSDT = await ethers.getContractFactory("MockERC20");
      const mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
      await mockUSDT.waitForDeployment();
      usdtAddress = await mockUSDT.getAddress();
      console.log("✅ MockUSDT deployed to:", usdtAddress);
      
      // Mint some tokens to deployer for testing
      await mockUSDT.mint(deployer.address, ethers.parseUnits("10000", 6));
      console.log("💰 Minted 10,000 USDT to deployer");
    }
    
    // Deploy cUSDT
    console.log("🔐 Deploying cUSDT...");
    const cUSDTFactory = await ethers.getContractFactory("cUSDT");
    const cUSDT = await cUSDTFactory.deploy(usdtAddress);
    await cUSDT.waitForDeployment();
    const cUSDTAddress = await cUSDT.getAddress();
    console.log("✅ cUSDT deployed to:", cUSDTAddress);
    
    // Deploy SecretPlatform
    console.log("🏛️ Deploying SecretPlatform...");
    const SecretPlatformFactory = await ethers.getContractFactory("SecretPlatform");
    const secretPlatform = await SecretPlatformFactory.deploy(cUSDTAddress);
    await secretPlatform.waitForDeployment();
    const platformAddress = await secretPlatform.getAddress();
    console.log("✅ SecretPlatform deployed to:", platformAddress);
    
    console.log("\n🎉 Deployment Summary:");
    console.log("USDT Token:", usdtAddress);
    console.log("cUSDT Token:", cUSDTAddress);
    console.log("SecretPlatform:", platformAddress);
    
    return {
      usdt: usdtAddress,
      cUSDT: cUSDTAddress, 
      platform: platformAddress
    };
  });

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

// Task: Set operator for cUSDT transfers
task("approve-platform", "Approve SecretPlatform as operator for cUSDT")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addOptionalParam("duration", "Duration in seconds (default: 1 year)", "31536000")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    
    const until = Math.floor(Date.now() / 1000) + parseInt(taskArguments.duration);
    
    console.log("🔐 Approving platform as operator...");
    console.log("Platform:", taskArguments.platform);
    console.log("Valid until:", new Date(until * 1000).toISOString());
    
    const approveTx = await platform.approveTokenOperator(until);
    await approveTx.wait();
    
    console.log("✅ Platform approved as operator");
    console.log("Transaction:", approveTx.hash);
  });

// Task: Deposit cUSDT to platform
task("deposit", "Deposit cUSDT to SecretPlatform")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("amount", "Amount to deposit")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const amount = BigInt(taskArguments.amount);
    
    console.log("💰 Depositing to SecretPlatform...");
    console.log("Amount:", taskArguments.amount);
    
    // Create encrypted input using hre.fhevm
    const { fhevm } = hre;
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
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const amount = BigInt(taskArguments.amount);
    
    console.log("🔐 Creating secret transfer...");
    console.log("To:", taskArguments.to);
    console.log("Amount:", taskArguments.amount);
    
    // Create encrypted input using hre.fhevm
    const { fhevm } = hre;
    const input = fhevm.createEncryptedInput(taskArguments.platform, signer.address);
    input.add64(amount);
    const encryptedInput = await input.encrypt();
    
    const transferTx = await platform.encryptedTransferTo(
      taskArguments.to,
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
  .addParam("from", "Address that sent the transfer")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    
    console.log("💸 Claiming transfer...");
    console.log("From:", taskArguments.from);
    console.log("To:", signer.address);
    
    // Check if transfer record exists
    const hasTransfer = await platform.hasTransferRecord(signer.address, taskArguments.from);
    if (!hasTransfer) {
      console.log("❌ No transfer record found from", taskArguments.from);
      return;
    }
    
    const claimTx = await platform.encryptClaim(taskArguments.from);
    await claimTx.wait();
    
    console.log("✅ Transfer claimed successfully");
    console.log("Transaction:", claimTx.hash);
  });

// Task: Withdraw from platform
task("withdraw", "Withdraw cUSDT from SecretPlatform")
  .addParam("platform", "Address of the SecretPlatform contract")
  .addParam("amount", "Amount to withdraw")
  .setAction(async function (taskArguments: TaskArguments, { ethers }) {
    const [signer] = await ethers.getSigners();
    const platform = await ethers.getContractAt("SecretPlatform", taskArguments.platform);
    const amount = BigInt(taskArguments.amount);
    
    console.log("💳 Withdrawing from SecretPlatform...");
    console.log("Amount:", taskArguments.amount);
    
    // Create encrypted input using hre.fhevm
    const { fhevm } = hre;
    const input = fhevm.createEncryptedInput(taskArguments.platform, signer.address);
    input.add64(amount);
    const encryptedInput = await input.encrypt();
    
    const withdrawTx = await platform.withdraw(
      encryptedInput.handles[0],
      encryptedInput.inputProof
    );
    await withdrawTx.wait();
    
    console.log("✅ Withdrawal successful");
    console.log("Transaction:", withdrawTx.hash);
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

// Task: Complete workflow demo
task("demo", "Run a complete SecretPlatform demo")
  .addOptionalParam("users", "Number of users for demo", "2")
  .setAction(async function (taskArguments: TaskArguments, { ethers, run }) {
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
    const { fhevm } = ethers;
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
      await platform.connect(userSigners[1]).encryptClaim(userSigners[0].address);
    }
    
    console.log("\n🎉 Demo completed successfully!");
    console.log("📋 Contract addresses:");
    console.log("  USDT:", contracts.usdt);
    console.log("  cUSDT:", contracts.cUSDT);
    console.log("  Platform:", contracts.platform);
  });

export default {};