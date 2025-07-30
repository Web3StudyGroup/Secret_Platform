import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  chainId: number | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const isConnected = !!account;

  const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await browserProvider.getSigner();
          const address = await signer.getAddress();
          const network = await browserProvider.getNetwork();
          
          setProvider(browserProvider);
          setSigner(signer);
          setAccount(address);
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
  };

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await browserProvider.getSigner();
          const address = await signer.getAddress();
          const network = await browserProvider.getNetwork();
          
          setProvider(browserProvider);
          setSigner(signer);
          setAccount(address);
          setChainId(Number(network.chainId));
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect();
        } else {
          connect();
        }
      });

      window.ethereum.on('chainChanged', () => {
        connect();
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: WalletContextType = {
    provider,
    signer,
    account,
    isConnected,
    connect,
    disconnect,
    chainId,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};