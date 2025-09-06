"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatEther } from "ethers";
import useIsomorphicEffect from "../hooks/useIsomorphicEffect";
import { Wallet, XCircle } from "lucide-react";

interface WalletInfo {
  address: string;
  balance: string;
  chainId: string;
}

export default function WalletConnect() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after the component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

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

      localStorage.removeItem("wallet_disconnected");

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
    localStorage.setItem("wallet_disconnected", "true");
  };

  useIsomorphicEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const ethereum = window.ethereum;
    if (!ethereum) return;

    const checkConnection = async () => {
      try {
        const isDisconnected =
          localStorage.getItem("wallet_disconnected") === "true";
        if (isDisconnected) {
          return;
        }

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
        localStorage.removeItem("wallet_disconnected");
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
  }, [isClient, updateWalletInfo, walletInfo?.address]);

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
      {isClient && walletInfo ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full flex items-center space-x-2 border border-blue-200 transition-all duration-200 hover:border-blue-400 group"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
            <span className="text-sm font-medium truncate group-hover:text-blue-500">
              {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
            </span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              } text-blue-500`}
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
            <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white/95 backdrop-blur-sm border border-blue-200 shadow-xl z-[100] animate-gradient">
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <p className="text-blue-500 text-xs">Account</p>
                  <p className="text-gray-800 text-sm font-mono break-all bg-gray-100/50 p-2 rounded border border-blue-100">
                    {walletInfo.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-500 text-xs">Balance</p>
                  <p className="text-gray-800 text-sm font-mono">
                    {Number(walletInfo.balance).toFixed(4)} ETH
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-blue-500 text-xs">Network</p>
                  <p className="text-gray-800 text-sm font-mono">
                    {getNetworkName(walletInfo.chainId)}
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-200">
                  <button
                    onClick={disconnectWallet}
                    className="w-full text-center py-2 px-4 rounded bg-red-100/50 hover:bg-red-200 text-red-600 hover:text-red-500 text-sm transition-all duration-200 border border-red-300 hover:border-red-400"
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
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 
            transition-all duration-200 hover:scale-105 border border-blue-500/50 
            shadow-md hover:shadow-lg"
        >
          <Wallet className="h-5 w-5" />
          <span>Connect Wallet</span>
        </button>
      )}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2">
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg border border-red-300">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}