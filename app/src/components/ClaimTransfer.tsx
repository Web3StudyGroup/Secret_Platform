import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Gift, Loader2, RefreshCw } from 'lucide-react';

export const ClaimTransfer: React.FC = () => {
  const { signer, isConnected, account } = useWallet();
  const { toast } = useToast();
  const [transferRecord, setTransferRecord] = useState('');
  const [isClaimLoading, setIsClaimLoading] = useState(false);
  const [isCheckingRecord, setIsCheckingRecord] = useState(false);

  const contractService = signer ? new ContractService(signer) : null;

  const checkTransferRecord = async () => {
    if (!contractService || !account) return;

    setIsCheckingRecord(true);
    try {
      const platform = contractService.getSecretPlatformContract();
      const record = await platform.getTransferRecord(account);
      setTransferRecord(record);
      
      if (record === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        toast({
          title: "No Transfer Found",
          description: "No pending transfer found for your address",
        });
      } else {
        toast({
          title: "Transfer Found",
          description: "You have a pending transfer ready to claim",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check transfer record",
        variant: "destructive",
      });
    } finally {
      setIsCheckingRecord(false);
    }
  };

  const handleClaimTransfer = async () => {
    if (!contractService) return;

    setIsClaimLoading(true);
    try {
      await contractService.claimTransfer();
      toast({
        title: "Success",
        description: "Transfer claimed successfully! Funds have been added to your platform balance.",
      });
      setTransferRecord('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to claim transfer",
        variant: "destructive",
      });
    } finally {
      setIsClaimLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Claim Transfer</CardTitle>
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
            <Gift className="h-5 w-5" />
            Check for Transfers
          </CardTitle>
          <CardDescription>
            Check if someone has sent you a secret transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={checkTransferRecord}
            disabled={isCheckingRecord}
            variant="outline"
            className="w-full"
          >
            {isCheckingRecord ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check for Pending Transfers
          </Button>

          {transferRecord && transferRecord !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Transfer Record Found:</p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {transferRecord}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You have a pending transfer ready to claim!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {transferRecord && transferRecord !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Claim Your Transfer
            </CardTitle>
            <CardDescription>Claim the secret transfer sent to you</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleClaimTransfer}
              disabled={isClaimLoading}
              className="w-full"
            >
              {isClaimLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Gift className="h-4 w-4 mr-2" />
              )}
              Claim Transfer
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 How to Claim Transfers</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. Click "Check for Pending Transfers" to see if you have any</p>
          <p>2. If a transfer is found, you'll see the encrypted record</p>
          <p>3. Click "Claim Transfer" to add the funds to your platform balance</p>
          <p>4. The claimed amount will be added to your encrypted platform balance</p>
          <p className="font-medium text-foreground mt-4">
            🎁 You can only claim transfers sent specifically to your address
          </p>
        </CardContent>
      </Card>
    </div>
  );
};