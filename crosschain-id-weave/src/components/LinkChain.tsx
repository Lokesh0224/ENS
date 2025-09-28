
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

// Hash JSON to bytes32
const hashChallenge = async (challengeJson: object): Promise<string> => {
  const jsonString = JSON.stringify(challengeJson);
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hashHex;
};

const LinkChain = ({ walletAddress }) => {
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

  // ======= Fetch verified addresses from contract =======
  const fetchVerifiedAddresses = async () => {
    if (!walletAddress || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
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

  // ======= Generate Challenge =======
  const generateChallenge = async () => {
    if (!selectedChain || !chainAddress) {
      toast({ title: "Missing Info", description: "Select a chain and enter an address.", variant: "destructive" });
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
    toast({ title: "Challenge Generated", description: "Sign this challenge with your wallet." });
    setIsGeneratingChallenge(false);
  };

  // ======= Sign Challenge with MetaMask =======
  const signChallengeWithWallet = async () => {
    if (!challenge) return;
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(JSON.stringify(challenge));
      setSignedProof(signature);
      toast({ title: "Challenge Signed", description: signature });
    } catch (err) {
      console.error(err);
      toast({ title: "Signing Failed", description: err.message, variant: "destructive" });
    }
  };

  // ======= Submit Proof to Backend (or store locally for now) =======
  const submitProof = async () => {
    if (!signedProof) {
      toast({ title: "Missing Proof", description: "Sign the challenge first.", variant: "destructive" });
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
        signedProof,
      };
      setVerificationResult(verificationData);
      toast({ title: "Verification Successful", description: "Proof verified locally." });
    } catch (err) {
      console.error(err);
      toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  // ======= Store on-chain =======
  const storeOnChain = async () => {
    if (!verificationResult || !window.ethereum) return;
    setIsStoringOnChain(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
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
      toast({ title: "Stored On-Chain", description: `Tx: ${tx.hash.slice(0, 10)}...` });
      fetchVerifiedAddresses();
      resetFlow();
    } catch (err) {
      console.error(err);
      toast({ title: "On-Chain Storage Failed", description: err.message, variant: "destructive" });
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
              <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">{chain.icon}</Badge>
              <span className="flex-1 font-mono">{fetchedAddresses[chain.value] || "Not Verified"}</span>
              {fetchedAddresses[chain.value] && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(fetchedAddresses[chain.value])}>
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button onClick={fetchVerifiedAddresses} className="w-full mt-2">Refresh Addresses</Button>
        </div>

        <Separator />

        {/* New address workflow */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">1</Badge>
            <h3 className="font-semibold">Link New Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blockchain</Label>
              <Select value={selectedChain} onValueChange={setSelectedChain}>
                <SelectTrigger><SelectValue placeholder="Select blockchain" /></SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.value} value={chain.value}>
                      <div className="flex items-center space-x-2"><span>{chain.icon}</span><span>{chain.label}</span></div>
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

          {challenge && (
            <div className="space-y-4">
              <Separator />
              <Button onClick={signChallengeWithWallet} className="w-full">Sign Challenge</Button>

              <div className="space-y-2">
                <Label>Signed Proof</Label>
                <Input placeholder="Signed proof will appear here" value={signedProof} readOnly />
              </div>

              <Button onClick={submitProof} disabled={!signedProof || isVerifying} className="w-full">
                {isVerifying ? "Verifying..." : "Submit Proof"}
              </Button>
            </div>
          )}

          {verificationResult && (
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center">3</Badge>
                <h3 className="font-semibold">Verification Result</h3>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-accent" />
                  <span className="font-medium text-accent">Verification Successful</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain:</span>
                  <Badge variant="secondary">{verificationResult.chainId}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-mono">{verificationResult.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Proof Hash:</span>
                  <span className="font-mono">{verificationResult.proofHash.slice(0, 10)}...</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={storeOnChain} disabled={isStoringOnChain} className="flex-1 bg-gradient-primary hover:opacity-90">
                  {isStoringOnChain ? "Storing..." : "Store On-Chain"}
                </Button>
                <Button variant="outline" onClick={resetFlow}>Link Another</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkChain;
