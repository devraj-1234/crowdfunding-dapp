"use client";

// import CrowdFundABI from "../contracts/CrowdFundABI.json";
import { useState, useEffect } from "react";
// import { Contract, BrowserProvider } from "ethers";

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    setError(null);
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to connect wallet");
    }
  };

  // Disconnect wallet (clear state only)
  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  // Check connection on mount
  useEffect(() => {
    async function checkConnection() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts);
        }
      }
    }
    checkConnection();
  }, []);
  

  return (
    <div>
      {walletAddress ? (
        <>
          <p>Connected wallet: {walletAddress}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect MetaMask</button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
