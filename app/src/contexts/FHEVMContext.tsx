import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { initSDK } from '@zama-fhe/relayer-sdk/bundle';

interface FHEVMContextType {
  instance: any | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializeInstance: () => Promise<any>;
  error: string | null;
}

const FHEVMContext = createContext<FHEVMContextType | undefined>(undefined);

interface FHEVMProviderProps {
  children: ReactNode;
}

export const FHEVMProvider: React.FC<FHEVMProviderProps> = ({ children }) => {
  const [instance, setInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { provider } = useWallet();

  const initializeInstance = useCallback(async () => {
    // Return existing instance if already initialized
    if (isInitialized && instance) {
      console.log('FHEVM instance already initialized, returning existing instance');
      return instance;
    }

    // Don't start multiple initialization processes
    if (isInitializing) {
      console.log('FHEVM instance initialization in progress, waiting...');
      // Wait for the current initialization to complete
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return instance;
    }

    console.log('Initializing FHEVM instance...');
    
    try {
      setIsInitializing(true);
      setError(null);
      
      // Initialize the SDK
      await initSDK();
      
      if (provider) {
        // Create instance with Sepolia config and wallet provider
        const config = { 
          ...SepoliaConfig, 
          network: provider 
        };
        const fhevmInstance = await createInstance(config);
        
        setInstance(fhevmInstance);
        setIsInitialized(true);
        setIsInitializing(false);
        
        console.log('FHEVM instance initialized successfully');
        return fhevmInstance;
      } else {
        throw new Error('Wallet provider not available');
      }
    } catch (error) {
      console.error('Failed to initialize FHEVM instance:', error);
      setError('FHEVM instance initialization failed');
      setIsInitializing(false);
      throw error;
    }
  }, [isInitialized, instance, isInitializing, provider]);

  return (
    <FHEVMContext.Provider value={{
      instance,
      isInitialized,
      isInitializing,
      initializeInstance,
      error,
    }}>
      {children}
    </FHEVMContext.Provider>
  );
};

export const useFHEVM = () => {
  const context = useContext(FHEVMContext);
  if (context === undefined) {
    throw new Error('useFHEVM must be used within a FHEVMProvider');
  }
  return context;
};