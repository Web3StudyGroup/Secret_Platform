import React from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import { FHEVMProvider } from '@/contexts/FHEVMContext';
import { Dashboard } from '@/components/Dashboard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <WalletProvider>
      <FHEVMProvider>
        <div className="App">
          <Dashboard />
          <Toaster />
        </div>
      </FHEVMProvider>
    </WalletProvider>
  );
}

export default App;