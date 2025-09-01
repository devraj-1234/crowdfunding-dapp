"use client";

import { useState, useEffect, useCallback } from "react";
import { formatEther } from "ethers";

interface WalletInfo {
  address: string;
  balance: string;
  chainId: string;
}

export default function WalletConnect() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getBalance = useCallback(async (address: string): Promise<string> => {
    if (!window.ethereum) return "0";
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      return formatEther(balance as string);
    } catch (err) {
      console.error("Error fetching balance:", err);
      return "0";
    }
  }, []);

  const getChainId = useCallback(async (): Promise<string> => {
    if (!window.ethereum) return "0x1";
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      return chainId as string;
    } catch (err) {
      console.error("Error fetching chainId:", err);
      return "0x1"; // Default to Ethereum mainnet
    }
  }, []);

  const updateWalletInfo = useCallback(
    async (address: string) => {
      const [balance, chainId] = await Promise.all([
        getBalance(address),
        getChainId(),
      ]);
      setWalletInfo({ address, balance, chainId });
    },
    [getBalance, getChainId]
  );

  const connectWallet = async () => {
    setError(null);
    try {
      if (!window.ethereum) {
        setError("MetaMask is not installed");
        return;
      }
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWalletInfo(null);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const checkConnection = async () => {
      try {
        const accounts = (await ethereum.request({
          method: "eth_accounts",
        })) as string[];

        if (accounts.length > 0) {
          await updateWalletInfo(accounts[0]);
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    };

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        await updateWalletInfo(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = async () => {
      if (walletInfo?.address) {
        await updateWalletInfo(walletInfo.address);
      }
    };

    checkConnection();

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [updateWalletInfo, walletInfo?.address]);

  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      "0x1": "Ethereum",
      "0x5": "Goerli",
      "0xaa36a7": "Sepolia",
      "0x89": "Polygon",
      "0x13881": "Mumbai",
    };
    return networks[chainId] || `Chain ${parseInt(chainId, 16)}`;
  };

  return (
    <div className="relative">
      {walletInfo ? (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 border border-green-500/20 transition-all duration-200 hover:border-green-500/40 group"
          >
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-sm font-medium truncate group-hover:text-green-400">
              {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
            </span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              } text-green-500`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg bg-gray-900/95 backdrop-blur-sm border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)] z-50 animate-gradient">
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-green-500 text-xs">Account</p>
                  <p className="text-white text-sm font-mono break-all bg-gray-800/50 p-2 rounded border border-green-500/10">
                    {walletInfo.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-green-500 text-xs">Balance</p>
                  <p className="text-white text-sm font-mono">
                    {Number(walletInfo.balance).toFixed(4)} ETH
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-green-500 text-xs">Network</p>
                  <p className="text-white text-sm font-mono">
                    {getNetworkName(walletInfo.chainId)}
                  </p>
                </div>
                <div className="pt-2 border-t border-green-500/20">
                  <button
                    onClick={disconnectWallet}
                    className="w-full text-center py-2 px-4 rounded bg-red-900/50 hover:bg-red-800 text-red-400 hover:text-red-300 text-sm transition-all duration-200 border border-red-500/20 hover:border-red-500/40"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 
            transition-all duration-200 hover:scale-105 border border-green-500/50 
            shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Connect MetaMask</span>
        </button>
      )}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="bg-red-900/50 text-red-200 text-sm p-3 rounded-lg border border-red-800">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
