"use client";

import { useState } from "react";
import { getContract } from "@/lib/web3";

export default function Home() {
  const [status, setStatus] = useState<string>("");

  // connect wallet
  async function connectWallet() {
    if (!window.ethereum) return setStatus("Install MetaMask!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setStatus("Wallet connected ✅");
  }

  // create dummy campaign
  async function createCampaign() {
    try {
      const contract = await getContract();
      const tx = await contract.createCampaign(
        "Test Campaign",
        "Just testing frontend",
        1000000000000000n, // 0.001 ETH
        1 // 1 day
      );
      await tx.wait();
      setStatus("Campaign created ✅");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  // fund campaign #1
  async function fundCampaign() {
    try {
      const contract = await getContract();
      const tx = await contract.fundCampaign(1, {
        value: 1000000000000000n, // 0.001 ETH
      });
      await tx.wait();
      setStatus("Funded campaign #1 ✅");
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  // read campaign #1
  async function readCampaign() {
    try {
      const contract = await getContract();
      const camp = await contract.campaigns(1);
      setStatus(
        `Campaign #1: ${camp.title}, pledged: ${camp.pledged.toString()}`
      );
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  }

  return (
    <main className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">CrowdFund Test</h1>

      <button
        onClick={connectWallet}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Connect Wallet
      </button>

      <button
        onClick={createCampaign}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Create Test Campaign
      </button>

      <button
        onClick={fundCampaign}
        className="px-4 py-2 bg-yellow-500 text-black rounded"
      >
        Fund Campaign #1
      </button>

      <button
        onClick={readCampaign}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Read Campaign #1
      </button>

      <p className="mt-4">{status}</p>
    </main>
  );
}
