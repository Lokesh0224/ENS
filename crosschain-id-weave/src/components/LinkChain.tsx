import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LinkChainProps {
  walletAddress: string;
  provider: any;
}

interface Challenge {
  chainId: string;
  address: string;
  challenge: string;
  timestamp: number;
}

interface VerificationResult {
  proofHash: string;
  verified: boolean;
  chainId: string;
  address: string;
}

const LinkChain: React.FC<LinkChainProps> = ({ walletAddress, provider }) => {
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [chainAddress, setChainAddress] = useState<string>('');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [signedProof, setSignedProof] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isStoringOnChain, setIsStoringOnChain] = useState(false);
  const { toast } = useToast();

  const chains = [
    { value: 'bitcoin', label: 'Bitcoin', icon: '₿' },
    { value: 'solana', label: 'Solana', icon: '◎' },
  ];

  const generateChallenge = async () => {
    if (!selectedChain || !chainAddress) {
      toast({
        title: "Missing Information",
        description: "Please select a chain and enter an address.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingChallenge(true);
    try {
      // Mock API call to backend
      const challengeData: Challenge = {
        chainId: selectedChain,
        address: chainAddress,
        challenge: `Verify ownership of ${selectedChain} address ${chainAddress} for ENS identity ${walletAddress} at ${Date.now()}`,
        timestamp: Date.now(),
      };
      
      setChallenge(challengeData);
      toast({
        title: "Challenge Generated",
        description: "Sign this challenge with your non-EVM wallet.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate challenge.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const submitProof = async () => {
    if (!challenge || !signedProof) {
      toast({
        title: "Missing Proof",
        description: "Please provide the signed proof.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Mock API call to backend /verify
      const verificationData: VerificationResult = {
        proofHash: `0x${Math.random().toString(16).slice(2, 66)}`, // Mock hash
        verified: true,
        chainId: challenge.chainId,
        address: challenge.address,
      };
      
      setVerificationResult(verificationData);
      toast({
        title: "Verification Successful",
        description: "Your proof has been verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Failed to verify the proof.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const storeOnChain = async () => {
    if (!verificationResult) return;

    setIsStoringOnChain(true);
    try {
      // Mock contract interaction
      const signer = await provider.getSigner();
      
      // This would be the actual contract call:
      // const resolverContract = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, signer);
      // await resolverContract.setVerifiedAddress(verificationResult.proofHash, verificationResult.address);
      
      // Mock transaction hash
      const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
      
      toast({
        title: "Stored On-Chain",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
    } catch (error) {
      toast({
        title: "On-Chain Storage Failed",
        description: "Failed to store verification on blockchain.",
        variant: "destructive",
      });
    } finally {
      setIsStoringOnChain(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard.",
    });
  };

  const resetFlow = () => {
    setChallenge(null);
    setSignedProof('');
    setVerificationResult(null);
    setSelectedChain('');
    setChainAddress('');
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle>Link Chain Address</CardTitle>
            <CardDescription>
              Link your non-EVM blockchain addresses to your ENS identity
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Step 1: Input Chain and Address */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge>
            <h3 className="font-semibold">Select Chain & Address</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter your address"
                value={chainAddress}
                onChange={(e) => setChainAddress(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateChallenge}
            disabled={!selectedChain || !chainAddress || isGeneratingChallenge}
            className="w-full"
          >
            {isGeneratingChallenge ? "Generating..." : "Generate Challenge"}
          </Button>
        </div>

        {/* Step 2: Challenge Display */}
        {challenge && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge>
                <h3 className="font-semibold">Sign Challenge</h3>
              </div>
              
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Challenge JSON:</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(challenge, null, 2))}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <pre className="text-xs bg-background rounded p-2 overflow-x-auto">
                  {JSON.stringify(challenge, null, 2)}
                </pre>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proof">Signed Proof</Label>
                <Input
                  id="proof"
                  placeholder="Paste your signed proof here"
                  value={signedProof}
                  onChange={(e) => setSignedProof(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={submitProof}
                disabled={!signedProof || isVerifying}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Submit Proof"}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Verification Result */}
        {verificationResult && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge>
                <h3 className="font-semibold">Verification Result</h3>
              </div>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="font-medium text-accent">Verification Successful</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chain:</span>
                    <Badge variant="secondary">{verificationResult.chainId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-mono">{verificationResult.address}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proof Hash:</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-mono text-xs">{verificationResult.proofHash.slice(0, 10)}...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(verificationResult.proofHash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={storeOnChain}
                  disabled={isStoringOnChain}
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {isStoringOnChain ? "Storing..." : "Store On-Chain"}
                </Button>
                <Button variant="outline" onClick={resetFlow}>
                  Link Another
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkChain;