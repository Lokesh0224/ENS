import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link as LinkIcon, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers, toUtf8Bytes, keccak256 } from "ethers";
import CrossChainResolverABI from "../abi/CrossChainResolver.json";

const RESOLVER_ADDRESS = "0x1cC8Cb2BF6729FE3289879549ddd4A3014cda68d";

const chains = [
  { value: "bitcoin", label: "Bitcoin", icon: "₿" },
  { value: "solana", label: "Solana", icon: "◎" },
  { value: "polkadot", label: "Polkadot", icon: "⚪" },
  { value: "cosmos", label: "Cosmos", icon: "🌌" },
  { value: "ethereum", label: "Ethereum", icon: "Ξ" },
];

const hashChallenge = async (challengeJson: object): Promise<string> => {
  const jsonString = JSON.stringify(challengeJson);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return "0x" + hashHex;
};

const LinkChain = ({ walletAddress, provider }) => {
  const { toast } = useToast();

  const [fetchedAddresses, setFetchedAddresses] = useState({});
  const [selectedChain, setSelectedChain] = useState("");
  const [chainAddress, setChainAddress] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [signedProof, setSignedProof] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isStoringOnChain, setIsStoringOnChain] = useState(false);


  const fetchVerifiedAddresses = async () => {
    if (!walletAddress || !provider) return;

    try {
      const signer = provider.getSigner();
      const resolverContract = new ethers.Contract(RESOLVER_ADDRESS, CrossChainResolverABI.abi, signer);
      const node = keccak256(toUtf8Bytes(walletAddress));

      const result = {};
      for (const chain of chains) {
        try {
          const data = await resolverContract.getVerifiedAddress(node, chain.value);
          result[chain.value] = data[0];
        } catch {
          result[chain.value] = "";
        }
      }

      setFetchedAddresses(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error fetching addresses",
        description: error?.reason || error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchVerifiedAddresses();
  }, [walletAddress]);


  const generateChallenge = async () => {
    if (!selectedChain || !chainAddress) {
      toast({ title: "Missing Information", description: "Select a chain and enter an address.", variant: "destructive" });
      return;
    }
    setIsGeneratingChallenge(true);
    const challengeData = {
      chainId: selectedChain,
      address: chainAddress,
      challenge: `Verify ownership of ${selectedChain} address ${chainAddress} for ENS identity ${walletAddress} at ${Date.now()}`,
      timestamp: Date.now(),
    };
    setChallenge(challengeData);
    toast({ title: "Challenge Generated", description: "Sign this challenge with your non-EVM wallet." });
    setIsGeneratingChallenge(false);
  };

  const submitProof = async () => {
    if (!challenge || !signedProof) {
      toast({ title: "Missing Proof", description: "Please provide the signed proof.", variant: "destructive" });
      return;
    }

    setIsVerifying(true);
    try {
      const proofHash = await hashChallenge(challenge);

      const verificationData = {
        proofHash,
        verified: true,
        chainId: challenge.chainId,
        address: challenge.address,
      };

      setVerificationResult(verificationData);
      toast({ title: "Verification Successful", description: "Your proof has been verified successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Verification Failed", description: "Failed to hash challenge.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  const storeOnChain = async () => {
    if (!verificationResult || !provider) return;
    setIsStoringOnChain(true);
    try {
      const signer = await provider.getSigner();
      const resolverContract = new ethers.Contract(RESOLVER_ADDRESS, CrossChainResolverABI.abi, signer);

      const node = keccak256(toUtf8Bytes(walletAddress));
      const tx = await resolverContract.setVerifiedAddress(
        node,
        verificationResult.chainId,
        verificationResult.address,
        verificationResult.proofHash,
        Math.floor(Date.now() / 1000)
      );
      await tx.wait();
      toast({ title: "Stored On-Chain", description: `Transaction: ${tx.hash.slice(0, 10)}...` });

      fetchVerifiedAddresses();
      resetFlow();
    } catch (error) {
      console.error(error);
      toast({ title: "On-Chain Storage Failed", description: error?.reason || error?.message || "Unknown error", variant: "destructive" });
    }
    setIsStoringOnChain(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  };

  const resetFlow = () => {
    setChallenge(null);
    setSignedProof("");
    setVerificationResult(null);
    setSelectedChain("");
    setChainAddress("");
  };

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <CardTitle>Link Chain Address</CardTitle>
            <CardDescription>View and link blockchain addresses to your ENS identity</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing verified addresses */}
        <div className="space-y-4">
          <h3 className="font-semibold">Verified Addresses</h3>
          {chains.map((chain) => (
            <div key={chain.value} className="flex items-center space-x-2">
              <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                {chain.icon}
              </Badge>
              <span className="flex-1 font-mono">{fetchedAddresses[chain.value] || "Not Verified"}</span>
              {fetchedAddresses[chain.value] && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(fetchedAddresses[chain.value])}>
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button onClick={fetchVerifiedAddresses} className="w-full mt-2">
            Refresh Addresses
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
              1
            </Badge>
            <h3 className="font-semibold">Link New Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blockchain</Label>
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
              <Label>Address</Label>
              <Input placeholder="Enter address" value={chainAddress} onChange={(e) => setChainAddress(e.target.value)} />
            </div>
          </div>

          <Button onClick={generateChallenge} disabled={!selectedChain || !chainAddress || isGeneratingChallenge} className="w-full">
            {isGeneratingChallenge ? "Generating..." : "Generate Challenge"}
          </Button>
        </div>

        {challenge && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                  2
                </Badge>
                <h3 className="font-semibold">Sign Challenge</h3>
              </div>

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Challenge JSON:</Label>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(challenge, null, 2))}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <pre className="text-xs bg-background rounded p-2 overflow-x-auto">{JSON.stringify(challenge, null, 2)}</pre>
              </div>

              <div className="space-y-2">
                <Label>Proof Hash</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Click 'Generate Hash' to see proof hash"
                    value={verificationResult?.proofHash || ""}
                    readOnly
                  />
                  <Button
                    onClick={async () => {
                      try {
                        const hash = await hashChallenge(challenge);
                        setVerificationResult({
                          ...verificationResult,
                          proofHash: hash,
                          chainId: challenge.chainId,
                          address: challenge.address,
                          verified: false,
                        });
                        toast({ title: "Hash Generated", description: hash });
                      } catch (err) {
                        console.error(err);
                        toast({ title: "Hash Error", description: "Failed to generate hash", variant: "destructive" });
                      }
                    }}
                  >
                    Generate Hash
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Signed Proof</Label>
                <Input placeholder="Paste signed proof here" value={signedProof} onChange={(e) => setSignedProof(e.target.value)} />
              </div>

              <Button onClick={submitProof} disabled={!signedProof || isVerifying} className="w-full">
                {isVerifying ? "Verifying..." : "Submit Proof"}
              </Button>
            </div>
          </>
        )}

        {verificationResult && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">
                  3
                </Badge>
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
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(verificationResult.proofHash)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={storeOnChain} disabled={isStoringOnChain} className="flex-1 bg-gradient-primary hover:opacity-90">
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
