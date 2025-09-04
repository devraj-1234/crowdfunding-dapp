import { ethers, BrowserProvider, JsonRpcSigner, Eip1193Provider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";

// Extend Window type for MetaMask
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export async function getContract() {
  if (typeof window === "undefined" || !window.ethereum) return null;

  // Create provider from MetaMask
  const provider: BrowserProvider = new BrowserProvider(window.ethereum);

  // Wait for signer
  const signer: JsonRpcSigner = await provider.getSigner();

  // Return contract instance
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}
