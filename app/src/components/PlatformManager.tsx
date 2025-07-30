import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';

import { ContractService } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parseAmount } from '@/lib/utils';
import { Shield, Download, Upload, Loader2 } from 'lucide-react';
import { useZamaSDK } from '@/contexts/ZamaSDKContext';

export const PlatformManager: React.FC = () => {
  const { signer, isConnected, account } = useWallet();
  const { instance, isInitialized,initializeSDK } = useZamaSDK();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isApproveLoading, setIsApproveLoading] = useState(false);
  const [platformBalance, setPlatformBalance] = useState('');

  const contractService = signer ? new ContractService(signer) : null;

  const loadPlatformBalance = async () => {
    if (!contractService || !account) return;
    
    try {
      const balances = await contractService.getBalances();
      setPlatformBalance(balances.platform);
    } catch (error) {
      console.error('Failed to load platform balance:', error);
    }
  };

  useEffect(() => {
    // console.log('=== PlatformManager useEffect ===');
    // console.log('isConnected:', isConnected);
    // console.log('contractService:', contractService);
    // console.log('account:', account);
    // console.log('signer:', signer);
    // console.log('isInitialized:', isInitialized);
    // console.log('instance:', instance);
    
    if (isConnected && contractService) {
      console.log('Loading platform balance and initializing SDK...');
      loadPlatformBalance();
      initializeSDK().then((result) => {
        // console.log('SDK initialization result:', result);
      }).catch((error) => {
        // console.error('SDK initialization error:', error);
      });
    }
  }, [isConnected, contractService, account]);

  const handleApprovePlatform = async () => {
    console.log('=== handleApprovePlatform START ===');
    console.log('contractService:', contractService);
    console.log('signer:', signer);
    console.log('account:', account);
    console.log('isConnected:', isConnected);
    
    if (!contractService) {
      console.error('No contractService available');
      return;
    }

    setIsApproveLoading(true);
    try {
      console.log('Calling approvePlatformOperator with duration 3600...');
      const result = await contractService.approvePlatformOperator(3600); // 1 hour
      console.log('approvePlatformOperator result:', result);
      
      toast({
        title: "Success",
        description: "Platform approved as operator for 1 hour",
      });
    } catch (error: any) {
      console.error('Error in handleApprovePlatform:', error);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "Error",
        description: error.message || "Failed to approve platform",
        variant: "destructive",
      });
    } finally {
      setIsApproveLoading(false);
      console.log('=== handleApprovePlatform END ===');
    }
  };

  const handleDeposit = async () => {
    console.log('=== handleDeposit START ===');
    console.log('contractService:', contractService);
    console.log('instance:', instance);
    console.log('depositAmount:', depositAmount);
    console.log('account:', account);
    console.log('isInitialized:', isInitialized);
    
    if (!contractService) {
      console.error('No contractService available');
      return;
    }
    if (!instance) {
      console.error('No instance available');
      return;
    }
    if (!depositAmount) {
      console.error('No depositAmount provided');
      return;
    }
    if (!account) {
      console.error('No account available');
      return;
    }

    setIsDepositLoading(true);
    try {
      // Convert amount to proper format (6 decimals for USDT)
      console.log('Converting amount:', depositAmount);
      const amount = parseAmount(depositAmount, 6);
      console.log('Parsed amount:', amount);
      
      // Create encrypted input
      console.log('Creating encrypted input...');
      const platformContract = contractService.getSecretPlatformContract();
      console.log('Platform contract target:', platformContract.target);
      
      const input = instance.createEncryptedInput(
        platformContract.target,
        account
      );
      input.add64(amount);
      console.log('Encrypting input...');
      const encryptedInput = await input.encrypt();
      console.log('Encrypted input:', encryptedInput);

      // Make deposit
      console.log('Making deposit to platform...');
      const result = await contractService.depositToPlatform(
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );
      console.log('Deposit result:', result);

      toast({
        title: "Success",
        description: `Deposited ${depositAmount} cUSDT to platform`,
      });
      setDepositAmount('');
      loadPlatformBalance();
    } catch (error: any) {
      console.error('Error in handleDeposit:', error);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "Error", 
        description: error.message || "Failed to deposit",
        variant: "destructive",
      });
    } finally {
      setIsDepositLoading(false);
      console.log('=== handleDeposit END ===');
    }
  };

  const handleWithdrawAll = async () => {
    if (!contractService) return;

    setIsWithdrawLoading(true);
    try {
      await contractService.withdrawAll();
      toast({
        title: "Success",
        description: "Withdrew all funds from platform",
      });
      loadPlatformBalance();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to withdraw",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>Please connect your wallet first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>Initializing FHEVM...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Platform Balance
          </CardTitle>
          <CardDescription>Your encrypted balance on SecretPlatform</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-mono text-muted-foreground">
            {platformBalance || 'Encrypted'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Use balance checker to decrypt and view actual amount
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approve Platform</CardTitle>
          <CardDescription>Allow platform to manage your cUSDT tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => {
              console.log('Approve Platform button clicked!');
              handleApprovePlatform();
            }}
            disabled={isApproveLoading}
            className="w-full"
          >
            {isApproveLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Approve Platform (1 hour)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Deposit to Platform
          </CardTitle>
          <CardDescription>Deposit cUSDT to SecretPlatform with encryption</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="deposit-amount">Amount (cUSDT)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="Enter amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => {
              console.log('Deposit to Platform button clicked!');
              console.log('depositAmount:', depositAmount);
              console.log('Button disabled:', !depositAmount || isDepositLoading);
              handleDeposit();
            }}
            disabled={!depositAmount || isDepositLoading}
            className="w-full"
          >
            {isDepositLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Deposit to Platform
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Withdraw All
          </CardTitle>
          <CardDescription>Withdraw all your funds from the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleWithdrawAll}
            disabled={isWithdrawLoading}
            variant="outline"
            className="w-full"
          >
            {isWithdrawLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Withdraw All Funds
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};