import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, ExternalLink, Copy, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResolveAddressProps {
  provider: any;
}

interface ResolvedAddress {
  ensName: string;
  chain: string;
  address: string;
  proofHash: string;
  timestamp: number;
  verified: boolean;
  metadata?: {
    lastUpdated: number;
    verificationMethod: string;
  };
}

const ResolveAddress: React.FC<ResolveAddressProps> = ({ provider }) => {
  const [ensName, setEnsName] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<ResolvedAddress | null>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const chains = [
    { value: 'bitcoin', label: 'Bitcoin', icon: '₿' },
    { value: 'solana', label: 'Solana', icon: '◎' },
    { value: 'ethereum', label: 'Ethereum', icon: 'Ξ' },
    { value: 'polkadot', label: 'Polkadot', icon: '⚪' },
    { value: 'cosmos', label: 'Cosmos', icon: '🌌' },

  ];

  const resolveAddress = async () => {
    if (!ensName || !selectedChain) {
      toast({
        title: "Missing Information",
        description: "Please enter an ENS name and select a chain.",
        variant: "destructive",
      });
      return;
    }

    setIsResolving(true);
    setError('');
    setResolvedAddress(null);

    try {
      // Mock contract call - in reality this would call the resolver contract
      // const resolverContract = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, provider);
      // const result = await resolverContract.getVerifiedAddress(ensName, selectedChain);
      
      // Mock data for demonstration
      const mockResults: { [key: string]: ResolvedAddress } = {
        'alice.eth': {
          ensName: 'alice.eth',
          chain: selectedChain,
          address: selectedChain === 'bitcoin' 
            ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
            : selectedChain === 'solana' 
            ? '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'
            : '0x742d35Cc123C3f123458595832F5d5b12345ABCD',
          proofHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          timestamp: Date.now() - 86400000, // 1 day ago
          verified: true,
          metadata: {
            lastUpdated: Date.now() - 3600000, // 1 hour ago
            verificationMethod: 'signature'
          }
        },
        'bob.eth': {
          ensName: 'bob.eth',
          chain: selectedChain,
          address: selectedChain === 'bitcoin' 
            ? '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5'
            : selectedChain === 'solana' 
            ? 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'
            : '0x123ABC123DEF123456789ABCDEF123456789ABC',
          proofHash: `0x${Math.random().toString(16).slice(2, 66)}`,
          timestamp: Date.now() - 172800000, // 2 days ago
          verified: true,
          metadata: {
            lastUpdated: Date.now() - 7200000, // 2 hours ago
            verificationMethod: 'signature'
          }
        }
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = mockResults[ensName.toLowerCase()];
      
      if (result) {
        setResolvedAddress(result);
        toast({
          title: "Address Resolved",
          description: `Found verified ${selectedChain} address for ${ensName}`,
        });
      } else {
        setError(`No verified ${selectedChain} address found for ${ensName}`);
      }
    } catch (error: any) {
      console.error('Error resolving address:', error);
      setError(error.message || 'Failed to resolve address');
      toast({
        title: "Resolution Failed",
        description: "Could not resolve the address.",
        variant: "destructive",
      });
    } finally {
      setIsResolving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard.",
    });
  };

  const formatAddress = (address: string, chain: string) => {
    if (chain === 'ethereum') {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExplorerUrl = (address: string, chain: string) => {
    const explorers: { [key: string]: string } = {
      bitcoin: `https://blockstream.info/address/${address}`,
      solana: `https://solscan.io/account/${address}`,
      ethereum: `https://etherscan.io/address/${address}`,
    };
    return explorers[chain];
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle>Resolve Address</CardTitle>
            <CardDescription>
              Look up verified blockchain addresses linked to ENS names
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ens-name">ENS Name</Label>
              <Input
                id="ens-name"
                placeholder="alice.eth"
                value={ensName}
                onChange={(e) => setEnsName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chain">Blockchain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blockchain" />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.value} value={chain.value}>
                      <div className="flex items-center space-x-2">
                        <span>{chain.icon}</span>
                        <span>{chain.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={resolveAddress}
            disabled={!ensName || !selectedChain || isResolving}
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            {isResolving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Resolving...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Resolve Address
              </>
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <>
            <Separator />
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive font-medium">{error}</span>
              </div>
            </div>
          </>
        )}

        {/* Results Section */}
        {resolvedAddress && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Verified Address Found</h3>
              </div>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="font-semibold">
                      {resolvedAddress.ensName}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="secondary">
                      {chains.find(c => c.value === resolvedAddress.chain)?.icon} {resolvedAddress.chain}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-accent border-accent">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                
                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <div className="flex items-center space-x-2 bg-background rounded-lg p-3">
                    <code className="flex-1 text-sm font-mono">
                      {resolvedAddress.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(resolvedAddress.address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a 
                        href={getExplorerUrl(resolvedAddress.address, resolvedAddress.chain)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Proof Hash</Label>
                    <div className="flex items-center space-x-1">
                      <code className="text-xs font-mono">
                        {resolvedAddress.proofHash.slice(0, 10)}...{resolvedAddress.proofHash.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(resolvedAddress.proofHash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p className="text-xs">
                      {resolvedAddress.metadata ? 
                        formatTimestamp(resolvedAddress.metadata.lastUpdated) :
                        formatTimestamp(resolvedAddress.timestamp)
                      }
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Verification Method</Label>
                    <Badge variant="outline" className="text-xs">
                      {resolvedAddress.metadata?.verificationMethod || 'signature'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Verified On</Label>
                    <p className="text-xs">
                      {formatTimestamp(resolvedAddress.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ResolveAddress;