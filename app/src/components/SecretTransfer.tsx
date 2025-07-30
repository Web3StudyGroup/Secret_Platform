import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useFHEVM } from '@/contexts/FHEVMContext';
import { ContractService } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { parseAmount } from '@/lib/utils';
import { Send, Loader2, Eye, EyeOff } from 'lucide-react';
import { ethers } from 'ethers';

export const SecretTransfer: React.FC = () => {
  const { signer, isConnected, account } = useWallet();
  const { instance, isInitialized } = useFHEVM();
  const { toast } = useToast();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferLoading, setIsTransferLoading] = useState(false);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);

  const contractService = signer ? new ContractService(signer) : null;

  const handleSecretTransfer = async () => {
    if (!contractService || !instance || !transferAmount || !recipientAddress || !account) return;

    // Validate recipient address
    if (!ethers.isAddress(recipientAddress)) {
      toast({
        title: "Error",
        description: "Invalid recipient address",
        variant: "destructive",
      });
      return;
    }

    setIsTransferLoading(true);
    try {
      // Convert amount to proper format (6 decimals for USDT)
      const amount = parseAmount(transferAmount, 6);
      
      // Create encrypted input
      const input = instance.createEncryptedInput(
        contractService.getSecretPlatformContract().target,
        account
      );
      input.add64(amount);
      const encryptedInput = await input.encrypt();

      // Make secret transfer
      await contractService.secretTransfer(
        recipientAddress,
        encryptedInput.handles[0],
        encryptedInput.inputProof
      );

      toast({
        title: "Success",
        description: `Secret transfer of ${transferAmount} cUSDT sent to recipient`,
      });
      setTransferAmount('');
      setRecipientAddress('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send secret transfer",
        variant: "destructive",
      });
    } finally {
      setIsTransferLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Secret Transfer</CardTitle>
          <CardDescription>Please connect your wallet first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Secret Transfer</CardTitle>
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
            <Send className="h-5 w-5" />
            Secret Transfer
          </CardTitle>
          <CardDescription>
            Send confidential transfers that recipients can claim later
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="amount">Amount (cUSDT)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount to transfer"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSecretTransfer}
            disabled={!transferAmount || !recipientAddress || isTransferLoading}
            className="w-full"
          >
            {isTransferLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Secret Transfer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {showPrivateInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            How Secret Transfers Work
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrivateInfo(!showPrivateInfo)}
            >
              {showPrivateInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {showPrivateInfo && (
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. You specify a recipient address and amount</p>
            <p>2. The amount is encrypted using FHE technology</p>
            <p>3. A transfer record is created on-chain (encrypted)</p>
            <p>4. The recipient can claim the transfer using their wallet</p>
            <p>5. Only the recipient can decrypt and claim the funds</p>
            <p className="font-medium text-foreground mt-4">
              💡 The transfer amount remains hidden from everyone except the recipient
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};