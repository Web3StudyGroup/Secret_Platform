import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { WalletConnection } from './WalletConnection';
import { USDTManager } from './USDTManager';
import { PlatformManager } from './PlatformManager';
import { SecretTransfer } from './SecretTransfer';
import { BalanceChecker } from './BalanceChecker';
import { ClaimTransfer } from './ClaimTransfer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Coins, 
  Shield, 
  Send, 
  Eye, 
  Gift, 
  Home,
  Menu,
  X
} from 'lucide-react';

const navigationItems = [
  { id: 'home', label: 'Overview', icon: Home },
  { id: 'usdt', label: 'USDT Manager', icon: Coins },
  { id: 'platform', label: 'Platform', icon: Shield },
  { id: 'transfer', label: 'Secret Transfer', icon: Send },
  { id: 'balances', label: 'Balance Checker', icon: Eye },
  { id: 'claim', label: 'Claim Transfers', icon: Gift },
];

export const Dashboard: React.FC = () => {
  const { isConnected } = useWallet();
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'usdt':
        return <USDTManager />;
      case 'platform':
        return <PlatformManager />;
      case 'transfer':
        return <SecretTransfer />;
      case 'balances':
        return <BalanceChecker />;
      case 'claim':
        return <ClaimTransfer />;
      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Secret Platform</CardTitle>
                <CardDescription>
                  Confidential transfers powered by Zama FHE technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      Private Transfers
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Send confidential transfers that only recipients can decrypt
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4" />
                      Encrypted Balances
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Your balances remain encrypted on-chain at all times
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Coins className="h-4 w-4" />
                      cUSDT Wrapper
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Wrap regular USDT into confidential cUSDT tokens
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4" />
                      Claim System
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Recipients can claim transfers sent to their address
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isConnected && (
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Follow these steps to start using the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Get USDT tokens</p>
                        <p className="text-sm text-muted-foreground">Use the USDT Manager to claim test tokens</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Wrap to cUSDT</p>
                        <p className="text-sm text-muted-foreground">Convert USDT to confidential cUSDT tokens</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Deposit to Platform</p>
                        <p className="text-sm text-muted-foreground">Approve and deposit cUSDT to the platform</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                      <div>
                        <p className="font-medium">Start transferring</p>
                        <p className="text-sm text-muted-foreground">Send secret transfers to other addresses</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Secret Platform</h1>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
            <WalletConnection />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className={`md:w-64 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};