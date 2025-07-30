import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Coins, ArrowRight, Loader2 } from 'lucide-react';

export const USDTManager: React.FC = () => {
  const { signer, isConnected } = useWallet();
  const { toast } = useToast();
  const [claimAmount, setClaimAmount] = useState('');
  const [wrapAmount, setWrapAmount] = useState('');
  const [usdtBalance, setUsdtBalance] = useState('0');
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isWrapLoading, setIsWrapLoading] = useState(false);

  const contractService = signer ? new ContractService(signer) : null;

  const loadBalance = async () => {
    if (!contractService) return;
    
    try {
      const balances = await contractService.getBalances();
      setUsdtBalance(balances.usdt);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  };

  useEffect(() => {
    if (isConnected && contractService) {
      loadBalance();
    }
  }, [isConnected, contractService]);

  const handleClaimUSDT = async () => {
    if (!contractService || !claimAmount) return;

    setIsClaimLoading(true);
    try {
      await contractService.claimUSDT(claimAmount);
      toast({
        title: "Success",
        description: `Claimed ${claimAmount} USDT successfully`,
      });
      setClaimAmount('');
      loadBalance();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim USDT",
        variant: "destructive",
      });
    } finally {
      setIsClaimLoading(false);
    }
  };

  const handleWrapUSDT = async () => {
    if (!contractService || !wrapAmount) return;

    setIsWrapLoading(true);
    try {
      await contractService.wrapUSDT(wrapAmount);
      toast({
        title: "Success", 
        description: `Wrapped ${wrapAmount} USDT to cUSDT successfully`,
      });
      setWrapAmount('');
      loadBalance();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to wrap USDT",
        variant: "destructive",
      });
    } finally {
      setIsWrapLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>USDT Management</CardTitle>
          <CardDescription>Please connect your wallet first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            USDT Balance
          </CardTitle>
          <CardDescription>Your current USDT balance</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{usdtBalance} USDT</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claim USDT</CardTitle>
          <CardDescription>Mint test USDT tokens for testing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="claim-amount">Amount</Label>
            <Input
              id="claim-amount"
              type="number"
              placeholder="Enter amount to claim"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleClaimUSDT} 
            disabled={!claimAmount || isClaimLoading}
            className="w-full"
          >
            {isClaimLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Coins className="h-4 w-4 mr-2" />
            )}
            Claim USDT
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Wrap USDT
            <ArrowRight className="h-4 w-4" />
            cUSDT
          </CardTitle>
          <CardDescription>Convert USDT to confidential cUSDT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wrap-amount">Amount</Label>
            <Input
              id="wrap-amount"
              type="number"
              placeholder="Enter amount to wrap"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleWrapUSDT} 
            disabled={!wrapAmount || isWrapLoading}
            className="w-full"
          >
            {isWrapLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Wrap to cUSDT
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};