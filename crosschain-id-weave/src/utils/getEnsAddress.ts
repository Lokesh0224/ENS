import { ethers } from "ethers";

const COIN_TYPES: Record<string, number> = {
  ethereum: 60,   // ETH
  bitcoin: 0,     // BTC
  litecoin: 2,    // LTC
  dogecoin: 3,    // DOGE
  solana: 501,    // Solana
  polkadot: 354,  // Polkadot
  cosmos: 118,    // Cosmos
};

export async function getEnsAddress(ensName: string, chain: string) {
  const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");

  const resolver = await provider.getResolver(ensName);
  if (!resolver) throw new Error("ENS name not found");

  const coinType = COIN_TYPES[chain.toLowerCase()];
  if (!coinType) throw new Error("Unsupported chain");

  const addr = await resolver.getAddress(coinType);
  return addr;
}
