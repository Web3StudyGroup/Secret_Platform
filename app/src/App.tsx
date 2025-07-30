import React from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import { ZamaSDKProvider } from './contexts/ZamaSDKContext'
import { Dashboard } from '@/components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <WalletProvider>
      <ZamaSDKProvider>
        <div className="App">
          <Dashboard />
          <Toaster />
        </div>
      </ZamaSDKProvider>
    </WalletProvider>
  );
}

export default App;