import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ConnectWallet from '@/components/ConnectWallet';
import LinkChain from '@/components/LinkChain';
import ResolveAddress from '@/components/ResolveAddress';
import heroImage from '@/assets/hero-blockchain.jpg';

const Index = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const handleWalletConnected = (address: string, providerInstance: ethers.BrowserProvider) => {
    setWalletAddress(address);
    setProvider(providerInstance);
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Cross-Chain Identity Hub
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
              Link your blockchain addresses across different networks to your ENS identity
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {!isConnected && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <ConnectWallet 
                  onWalletConnected={handleWalletConnected}
                  isConnected={isConnected}
                  walletAddress={walletAddress}
                />
              </div>
            </div>
          )}

          {isConnected && provider && (
            <Tabs defaultValue="link" className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass">
                <TabsTrigger value="link" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Link Chain
                </TabsTrigger>
                <TabsTrigger value="resolve" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Resolve Address
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="link" className="mt-6">
                <LinkChain 
                  walletAddress={walletAddress}
                  provider={provider}
                />
              </TabsContent>
              
              <TabsContent value="resolve" className="mt-6">
                <ResolveAddress provider={provider} />
              </TabsContent>
            </Tabs>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="glass">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-semibold">Multi-Chain Support</h3>
                <p className="text-muted-foreground">
                  Link Bitcoin, Solana, and other blockchain addresses to your ENS name
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-xl font-semibold">Cryptographic Proof</h3>
                <p className="text-muted-foreground">
                  Verify ownership with cryptographic signatures stored on-chain
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-xl font-semibold">Universal Identity</h3>
                <p className="text-muted-foreground">
                  One ENS name for all your blockchain identities across ecosystems
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;