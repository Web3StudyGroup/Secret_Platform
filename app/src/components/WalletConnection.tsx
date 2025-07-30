import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAddress } from '@/lib/utils';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';
import { NETWORK_CONFIG } from '@/config/contracts';

export const WalletConnection: React.FC = () => {
  const { account, isConnected, connect, disconnect, chainId } = useWallet();

  const switchToSepolia = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
        });
      } catch (error: any) {
        // If the chain hasn't been added to MetaMask, add it
        if (error.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia test network',
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SEP',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } catch (addError) {
            console.error('Failed to add Sepolia network:', addError);
          }
        } else {
          console.error('Failed to switch to Sepolia:', error);
        }
      }
    }
  };

  const isWrongNetwork = isConnected && chainId !== NETWORK_CONFIG.chainId;

  if (isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connected
          </CardTitle>
          <CardDescription>
            {isWrongNetwork ? 'Wrong network detected' : 'Your wallet is connected to the network'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Address:</p>
            <p className="text-sm text-muted-foreground font-mono">{formatAddress(account!)}</p>
          </div>
          
          {isWrongNetwork && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">Wrong Network</p>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please switch to Sepolia network to use the Secret Platform
              </p>
              <Button 
                onClick={switchToSepolia}
                variant="outline"
                size="sm"
                className="mt-2 w-full"
              >
                Switch to Sepolia
              </Button>
            </div>
          )}
          
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