import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { ContractService } from '@/contracts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/utils';
import { Eye, Loader2, RefreshCw } from 'lucide-react';
import { useZamaSDK } from '@/contexts/ZamaSDKContext';

export const BalanceChecker: React.FC = () => {
  const { signer, isConnected, account } = useWallet();
  const { instance, isInitialized, isInitializing, error } = useZamaSDK();
  const { toast } = useToast();
  const [encryptedBalances, setEncryptedBalances] = useState<{
    cUSDT: string;
    platform: string;
  }>({ cUSDT: '', platform: '' });
  const [decryptedBalances, setDecryptedBalances] = useState<{
    cUSDT: string;
    platform: string;
  }>({ cUSDT: '', platform: '' });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const contractService = signer ? new ContractService(signer) : null;

  const loadEncryptedBalances = async () => {
    if (!contractService || !account) return;

    setIsLoadingBalances(true);
    try {
      const balances = await contractService.getBalances();
      setEncryptedBalances({
        cUSDT: balances.cUSDT,
        platform: balances.platform
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load balances",
        variant: "destructive",
      });
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const decryptBalances = async () => {
    if (!instance || !signer || !account || !encryptedBalances.cUSDT || !encryptedBalances.platform) {
      toast({
        title: "Error",
        description: "Please load encrypted balances first",
        variant: "destructive",
      });
      return;
    }

    setIsDecrypting(true);
    try {
      // Generate keypair for decryption
      const keypair = instance.generateKeypair();
      
      // Prepare handle-contract pairs for both balances
      const handleContractPairs = [
        {
          handle: encryptedBalances.cUSDT,
          contractAddress: contractService!.getCUSDTContract().target as string,
        },
        {
          handle: encryptedBalances.platform,
          contractAddress: contractService!.getSecretPlatformContract().target as string,
        }
      ];

      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "1";
      const contractAddresses = [
        contractService!.getCUSDTContract().target as string,
        contractService!.getSecretPlatformContract().target as string
      ];

      // Create EIP712 signature
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      // Decrypt balances
      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        account,
        startTimeStamp,
        durationDays
      );

      setDecryptedBalances({
        cUSDT: result[encryptedBalances.cUSDT] ? formatAmount(result[encryptedBalances.cUSDT].toString(), 6) : '0',
        platform: result[encryptedBalances.platform] ? formatAmount(result[encryptedBalances.platform].toString(), 6) : '0'
      });

      toast({
        title: "Success",
        description: "Balances decrypted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to decrypt balances",
        variant: "destructive",
      });
    } finally {
      setIsDecrypting(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Balance Checker</CardTitle>
          <CardDescription>Please connect your wallet first</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Balance Checker</CardTitle>
          <CardDescription>
            {isInitializing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Initializing FHEVM...
              </div>
            ) : error ? (
              <div className="text-red-600">
                FHEVM 初始化失败: {error}
              </div>
            ) : (
              'Waiting for FHEVM initialization...'
            )}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              请检查网络连接和浏览器控制台以获取更多信息
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Encrypted Balances
          </CardTitle>
          <CardDescription>
            Load and decrypt your confidential balances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={loadEncryptedBalances}
            disabled={isLoadingBalances}
            variant="outline"
            className="w-full"
          >
            {isLoadingBalances ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Load Encrypted Balances
          </Button>
          
          {encryptedBalances.cUSDT && (
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">cUSDT Balance (Encrypted):</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {encryptedBalances.cUSDT}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Platform Balance (Encrypted):</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {encryptedBalances.platform}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {encryptedBalances.cUSDT && (
        <Card>
          <CardHeader>
            <CardTitle>Decrypt Balances</CardTitle>
            <CardDescription>
              Decrypt your balances to see the actual amounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={decryptBalances}
              disabled={isDecrypting}
              className="w-full"
            >
              {isDecrypting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Decrypt Balances
            </Button>

            {decryptedBalances.cUSDT && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-sm font-medium">cUSDT Balance:</p>
                  <p className="text-lg font-bold">{decryptedBalances.cUSDT} cUSDT</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Platform Balance:</p>
                  <p className="text-lg font-bold">{decryptedBalances.platform} cUSDT</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>💡 How Balance Decryption Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>1. First, load your encrypted balance handles from the contracts</p>
          <p>2. Generate a temporary keypair for decryption</p>
          <p>3. Sign an EIP712 permission message with your wallet</p>  
          <p>4. Send the encrypted balances to the relayer for decryption</p>
          <p>5. The relayer returns the decrypted values only to you</p>
          <p className="font-medium text-foreground mt-4">
            🔒 Your balance data never leaves encrypted form on-chain
          </p>
        </CardContent>
      </Card>
    </div>
  );
};