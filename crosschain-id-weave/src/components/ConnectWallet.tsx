import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface ConnectWalletProps {
  onWalletConnected: (address: string, provider: ethers.BrowserProvider) => void;
  isConnected: boolean;
  walletAddress: string;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ 
  onWalletConnected, 
  isConnected, 
  walletAddress 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setNetworkName(network.name);
          onWalletConnected(accounts[0].address, provider);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setNetworkName(network.name);
      onWalletConnected(address, provider);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Connect Wallet</CardTitle>
        <CardDescription>
          Connect your Ethereum wallet to access Cross-Chain Identity Hub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect MetaMask
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="text-accent font-medium">Wallet Connected</span>
            </div>
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Address:</span>
                <Badge variant="outline" className="font-mono">
                  {formatAddress(walletAddress)}
                </Badge>
              </div>
              
              {networkName && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network:</span>
                  <Badge variant="secondary">
                    {networkName}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
        
        {typeof window.ethereum === 'undefined' && (
          <div className="flex items-center space-x-2 text-warning text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>MetaMask not detected. Please install MetaMask.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectWallet;