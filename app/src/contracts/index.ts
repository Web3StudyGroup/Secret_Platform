import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '@/config/contracts';
import { USDT_ABI, CUSDT_ABI, SECRET_PLATFORM_ABI } from './abis';

export class ContractService {
  private signer: ethers.Signer;
  
  constructor(signer: ethers.Signer) {
    this.signer = signer;
  }

  // USDT Contract
  getUSDTContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.USDT, USDT_ABI, this.signer);
  }

  // cUSDT Contract  
  getCUSDTContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.cUSDT, CUSDT_ABI, this.signer);
  }

  // SecretPlatform Contract
  getSecretPlatformContract() {
    return new ethers.Contract(CONTRACT_ADDRESSES.SecretPlatform, SECRET_PLATFORM_ABI, this.signer);
  }

  // Helper functions
  async claimUSDT(amount: string) {
    const usdt = this.getUSDTContract();
    const address = await this.signer.getAddress();
    const amountBN = ethers.parseUnits(amount, 6);
    
    const tx = await usdt.mint(address, amountBN);
    return tx.wait();
  }

  async wrapUSDT(amount: string) {
    const usdt = this.getUSDTContract();
    const cusdt = this.getCUSDTContract();
    const address = await this.signer.getAddress();
    const amountBN = ethers.parseUnits(amount, 6);

    // First approve cUSDT to spend USDT
    const allowance = await usdt.allowance(address, CONTRACT_ADDRESSES.cUSDT);
    if (allowance < amountBN) {
      const approveTx = await usdt.approve(CONTRACT_ADDRESSES.cUSDT, amountBN);
      await approveTx.wait();
    }

    // Then wrap
    const wrapTx = await cusdt.wrap(address, amountBN);
    return wrapTx.wait();
  }

  async approvePlatformOperator(duration: number = 3600) {
    const platform = this.getSecretPlatformContract();
    const until = Math.floor(Date.now() / 1000) + duration;
    
    const tx = await platform.approveTokenOperator(until);
    return tx.wait();
  }

  async depositToPlatform(encryptedAmount: string, inputProof: string) {
    const platform = this.getSecretPlatformContract();
    const tx = await platform.deposit(encryptedAmount, inputProof);
    return tx.wait();
  }

  async secretTransfer(to: string, encryptedAmount: string, inputProof: string) {
    const platform = this.getSecretPlatformContract();
    const tx = await platform.encryptedTransferTo(to, encryptedAmount, inputProof);
    return tx.wait();
  }

  async claimTransfer() {
    const platform = this.getSecretPlatformContract();
    const tx = await platform.encryptClaim();
    return tx.wait();
  }

  async withdrawAll() {
    const platform = this.getSecretPlatformContract();
    const tx = await platform.withdrawAll();
    return tx.wait();
  }

  async getBalances() {
    const usdt = this.getUSDTContract();
    const cusdt = this.getCUSDTContract();
    const platform = this.getSecretPlatformContract();
    const address = await this.signer.getAddress();

    const [usdtBalance, cUSDTBalance, platformBalance] = await Promise.all([
      usdt.balanceOf(address),
      cusdt.confidentialBalanceOf(address),
      platform.getBalance(address)
    ]);

    return {
      usdt: ethers.formatUnits(usdtBalance, 6),
      cUSDT: cUSDTBalance,
      platform: platformBalance
    };
  }
}