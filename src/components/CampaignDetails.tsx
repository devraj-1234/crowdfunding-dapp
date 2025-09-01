"use client";

import { useState, useEffect } from "react";
import { Campaign } from "@/types/campaign";
import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther,
  Eip1193Provider,
} from "ethers";
import ProgressBar from "./ProgressBar";

interface ExtendedProvider extends Eip1193Provider {
  addListener: (eventName: string, handler: () => void) => void;
  removeListener: (eventName: string, handler: () => void) => void;
}
import {
  updatePledgedAmount,
  updateCampaignClaimedStatus,
} from "@/lib/firebase";
import {
  claimFunds as claimFundsFromContract,
  callOffCampaign as callOffCampaignFromContract,
} from "@/lib/contractUtils";

interface Props {
  campaign: Campaign;
  onBack: () => void;
  contractAddress: string;
  contractAbi: readonly object[];
}

export default function CampaignDetails({
  campaign,
  onBack,
  contractAddress,
  contractAbi,
}: Props) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>(campaign);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkCreator = async () => {
      if (!window.ethereum) return;
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setIsCreator(
        signer.address.toLowerCase() === currentCampaign.creator.toLowerCase()
      );
    };

    checkCreator();

    // Set up interval to check creator status periodically
    const interval = setInterval(checkCreator, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [currentCampaign.creator]);

  useEffect(() => {
    console.log("--- Claim Button Debug ---");
    console.log("Is Creator:", isCreator);
    console.log("Is Claimed:", currentCampaign.claimed);
    console.log(
      "Deadline Passed:",
      Date.now() / 1000 >= currentCampaign.deadline
    );
    console.log("Current Time:", new Date(Date.now()).toLocaleString());
    console.log(
      "Deadline:",
      new Date(currentCampaign.deadline * 1000).toLocaleString()
    );
    console.log(
      "Goal Met:",
      BigInt(currentCampaign.pledged) >= BigInt(currentCampaign.goal)
    );
    console.log("Pledged:", formatEther(currentCampaign.pledged), "ETH");
    console.log("Goal:", formatEther(currentCampaign.goal), "ETH");
    console.log("--------------------------");
  }, [isCreator, currentCampaign]);

  async function fundCampaign() {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    const campaignIdNumeric = Number(currentCampaign.chainId);
    if (Number.isNaN(campaignIdNumeric)) {
      setTxStatus("Error: On-chain Campaign ID is missing or invalid.");
      return;
    }

    try {
      setTxStatus("Waiting for transaction confirmation...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const tx = await contract.fundCampaign(campaignIdNumeric, {
        value: parseEther(amount),
      });
      await tx.wait();

      const currentPledged = BigInt(currentCampaign.pledged);
      const newPledged = currentPledged + BigInt(parseEther(amount));
      if (currentCampaign.id) {
        await updatePledgedAmount(currentCampaign.id, newPledged.toString());
      }

      setCurrentCampaign({
        ...currentCampaign,
        pledged: newPledged.toString(),
      });

      setTxStatus("Funding successful!");
      setAmount("");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setTxStatus(`Error: ${(err as { message?: string }).message}`);
      } else {
        setTxStatus(`Error: ${String(err)}`);
      }
    }
  }

  async function handleClaimFunds() {
    const campaignIdNumeric = Number(currentCampaign.chainId);
    if (Number.isNaN(campaignIdNumeric)) {
      setTxStatus("Error: On-chain Campaign ID is missing or invalid.");
      return;
    }

    try {
      setTxStatus("Claiming funds...");
      const tx = await claimFundsFromContract(campaignIdNumeric);
      await tx.wait();

      if (currentCampaign.id) {
        await updateCampaignClaimedStatus(currentCampaign.id);
      }

      setCurrentCampaign({ ...currentCampaign, claimed: true });
      setTxStatus("Funds claimed successfully!");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setTxStatus(`Error: ${(err as { message?: string }).message}`);
      } else {
        setTxStatus(`Error: ${String(err)}`);
      }
    }
  }

  async function handleCallOff() {
    const campaignIdNumeric = Number(currentCampaign.chainId);
    if (Number.isNaN(campaignIdNumeric)) {
      setTxStatus("Error: On-chain Campaign ID is missing or invalid.");
      return;
    }

    try {
      setTxStatus("Calling off campaign...");
      const tx = await callOffCampaignFromContract(campaignIdNumeric);
      await tx.wait();

      if (currentCampaign.id) {
        await updateCampaignClaimedStatus(currentCampaign.id);
      }

      setCurrentCampaign({ ...currentCampaign, claimed: true });
      setTxStatus("Campaign called off successfully!");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setTxStatus(`Error: ${(err as { message?: string }).message}`);
      } else {
        setTxStatus(`Error: ${String(err)}`);
      }
    }
  }

  const canClaim =
    isCreator &&
    !currentCampaign.claimed &&
    BigInt(currentCampaign.pledged) >= BigInt(currentCampaign.goal);

  const canCallOff =
    isCreator &&
    !currentCampaign.claimed &&
    BigInt(currentCampaign.pledged) < BigInt(currentCampaign.goal);

  // Debug logs
  console.log("Campaign Details:", {
    isCreator,
    currentCampaign,
    pledged: formatEther(currentCampaign.pledged),
    goal: formatEther(currentCampaign.goal),
    canClaim,
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        <span>← Back to Campaigns</span>
      </button>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {currentCampaign.title}
          </h2>
          <p className="text-gray-600 mb-4">{currentCampaign.description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Goal</p>
              <p className="text-xl font-semibold">
                {formatEther(currentCampaign.goal)} ETH
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pledged</p>
              <p className="text-xl font-semibold">
                {formatEther(currentCampaign.pledged)} ETH
              </p>
            </div>
          </div>

          <ProgressBar
            current={currentCampaign.pledged}
            goal={currentCampaign.goal}
          />

          <div className="mt-4">
            <p className="text-sm text-gray-600">Deadline</p>
            <p className="text-gray-800">
              {new Date(currentCampaign.deadline * 1000).toLocaleString()}
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">Campaign Creator</p>
            <p className="text-gray-800 font-mono break-all">
              {currentCampaign.creator}
            </p>
          </div>
        </div>

        {!currentCampaign.claimed && (
          <div className="space-y-4">
            {!isCreator && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Donation Amount (ETH)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.1"
                    step="0.01"
                    min="0"
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={fundCampaign}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Fund Campaign
                  </button>
                </div>
              </div>
            )}

            {isCreator && (
              <div className="flex gap-4">
                {canClaim && (
                  <button
                    onClick={handleClaimFunds}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Claim Funds
                  </button>
                )}
                {canCallOff && (
                  <button
                    onClick={handleCallOff}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Call Off Campaign
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {currentCampaign.claimed && (
          <div className="p-4 bg-green-100 text-green-700 rounded">
            This campaign has been successfully funded and claimed!
          </div>
        )}

        {txStatus && (
          <div
            className={`p-4 rounded ${
              txStatus.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {txStatus}
          </div>
        )}
      </div>
    </div>
  );
}
