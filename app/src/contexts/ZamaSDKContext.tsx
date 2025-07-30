import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import { initSDK } from '@zama-fhe/relayer-sdk/bundle';

interface ZamaSDKContextType {
  instance: any | null;
  isInitialized: boolean;
  isInitializing: boolean;
  initializeSDK: () => Promise<any>;
  error: string | null;
}

const ZamaSDKContext = createContext<ZamaSDKContextType | undefined>(undefined);

interface ZamaSDKProviderProps {
  children: ReactNode;
}

export const ZamaSDKProvider: React.FC<ZamaSDKProviderProps> = ({ children }) => {
  const [instance, setInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeSDK = useCallback(async () => {
    // console.log('=== ZamaSDK initializeSDK START ===');
    // console.log('isInitialized:', isInitialized);
    // console.log('instance:', instance);
    // console.log('isInitializing:', isInitializing);
    
    // Return existing instance if already initialized
    if (isInitialized && instance) {
      console.log('SDK already initialized, returning existing instance');
      return instance;
    }

    // Don't start multiple initialization processes
    if (isInitializing) {
      console.log('SDK initialization in progress, waiting...');
      // Wait for the current initialization to complete
      while (isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return instance;
    }

    console.log('Starting SDK initialization...');
    
    try {
      setIsInitializing(true);
      setError(null);
      
      // Check if window.ethereum is available
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }
      console.log('MetaMask detected');
      
      // Initialize the SDK
      console.log('Calling initSDK()...');
      await initSDK();
      console.log('initSDK() completed');
      
      // Create instance with Sepolia config
      const config = { 
        ...SepoliaConfig, 
        network: window.ethereum 
      };
      console.log('Creating instance with config:', config);
      const fhevmInstance = await createInstance(config);
      console.log('FHEVM instance created:', fhevmInstance);
      
      setInstance(fhevmInstance);
      setIsInitialized(true);
      setIsInitializing(false);
      
      console.log('SDK initialized successfully');
      console.log('=== ZamaSDK initializeSDK END ===');
      return fhevmInstance;
    } catch (error) {
      console.error('Failed to initialize SDK:', error);
      console.error('Error details:', error);
      setError(`SDK initialization failed: ${error.message}`);
      setIsInitializing(false);
      console.log('=== ZamaSDK initializeSDK ERROR END ===');
      throw error;
    }
  }, [isInitialized, instance, isInitializing]);

  return (
    <ZamaSDKContext.Provider value={{
      instance,
      isInitialized,
      isInitializing,
      initializeSDK,
      error,
    }}>
      {children}
    </ZamaSDKContext.Provider>
  );
};

export const useZamaSDK = () => {
  const context = useContext(ZamaSDKContext);
  if (context === undefined) {
    throw new Error('useZamaSDK must be used within a ZamaSDKProvider');
  }
  return context;
};