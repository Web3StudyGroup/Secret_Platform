import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut } from 'lucide-react';

export const WalletConnection: React.FC = () => {
  const { account, isConnected, connect, disconnect, chainId } = useWallet();

  if (isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            Your wallet is connected to the network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Address:</p>
            <p className="text-sm text-muted-foreground font-mono">{formatAddress(account!)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Chain ID:</p>
            <p className="text-sm text-muted-foreground">{chainId}</p>
          </div>
          <Button 
            onClick={disconnect} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect Wallet</CardTitle>
        <CardDescription>
          Connect your wallet to use the Secret Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={connect} className="w-full">
          <Wallet className="h-4 w-4 mr-2" />
          Connect MetaMask
        </Button>
      </CardContent>
    </Card>
  );
};