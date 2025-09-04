"use client";

import { useEffect, useState } from "react";
import { Campaign } from "../types/campaign";
import { ethers } from "ethers";
import {
  sendFundsToCampaign,
  claimFunds,
  callOffCampaign,
} from "../lib/contractUtils";
import {
  updatePledgedAmount,
  updateCampaignClaimedStatus,
} from "../lib/firebase";
import ProgressBar from "./ProgressBar";
import { Eip1193Provider } from "ethers";

export default function CampaignDetails({ campaign }: { campaign: Campaign }) {
  const [currentCampaign, setCurrentCampaign] = useState(campaign);
  const [isCreator, setIsCreator] = useState(false);
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const checkCreator = () => {
      const eth = window.ethereum as Eip1193Provider & {
        selectedAddress?: string;
      };
      if (eth?.selectedAddress) {
        setIsCreator(
          eth.selectedAddress.toLowerCase() ===
            currentCampaign.creator.toLowerCase()
        );
      }
    };

    checkCreator();
    const interval = setInterval(checkCreator, 1000);
    return () => clearInterval(interval);
  }, [currentCampaign.creator]);

  const handleFund = async () => {
    console.log(typeof amount);
    const parsedAmount = parseFloat(amount);
    console.log(parsedAmount);
    console.log(typeof parsedAmount);
    if (!currentCampaign?.id || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount to fund.");
      return;
    } else console.log("Valid amount:", parsedAmount);

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amountToFund = parsedAmount.toString();
      console.log(typeof amountToFund);
      console.log(amountToFund);
      const amountInWei = ethers.parseEther(amountToFund);
      console.log(typeof amountInWei);
      console.log(amountInWei);
      console.log("Calling sendFundsToCampaign...");
      // Use chainId instead of id as in the working version
      const campaignIdNumeric = Number(
        currentCampaign.chainId || currentCampaign.id
      );
      const tx = await sendFundsToCampaign(campaignIdNumeric, amountInWei);
      console.log(tx);
      await tx.wait();

      const newPledged = (
        BigInt(currentCampaign.pledged) + BigInt(amountInWei)
      ).toString();
      await updatePledgedAmount(currentCampaign.id, newPledged);

      setCurrentCampaign({ ...currentCampaign, pledged: newPledged });
      setSuccess("Thank you for your contribution!");
      setAmount("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fund campaign: ${errorMessage}`);
      console.error("Funding error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFunds = async () => {
    const campaignIdNumeric = Number(
      currentCampaign.chainId || currentCampaign.id
    );
    if (Number.isNaN(campaignIdNumeric)) {
      setError("Error: On-chain Campaign ID is missing or invalid.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log("Claiming funds for campaign ID:", campaignIdNumeric);
      const tx = await claimFunds(campaignIdNumeric);
      console.log("Claim transaction:", tx);
      await tx.wait();

      if (currentCampaign.id) {
        await updateCampaignClaimedStatus(currentCampaign.id);
      }

      setCurrentCampaign({ ...currentCampaign, claimed: true });
      setSuccess("Funds claimed successfully!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to claim funds: ${errorMessage}`);
      console.error("Claim error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCallOff = async () => {
    const campaignIdNumeric = Number(
      currentCampaign.chainId || currentCampaign.id
    );
    if (Number.isNaN(campaignIdNumeric)) {
      setError("Error: On-chain Campaign ID is missing or invalid.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log("Calling off campaign ID:", campaignIdNumeric);
      const tx = await callOffCampaign(campaignIdNumeric);
      console.log("Call off transaction:", tx);
      await tx.wait();

      if (currentCampaign.id) {
        await updateCampaignClaimedStatus(currentCampaign.id);
      }

      setCurrentCampaign({ ...currentCampaign, claimed: true });
      setSuccess("Campaign has been successfully called off.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to call off campaign: ${errorMessage}`);
      console.error("Call off error:", err);
    } finally {
      setLoading(false);
    }
  };

  const goalBigInt = BigInt(currentCampaign.goal);
  const pledgedBigInt = BigInt(currentCampaign.pledged);

  const canClaim =
    isCreator && !currentCampaign.claimed && pledgedBigInt >= goalBigInt;

  const canCallOff =
    isCreator && !currentCampaign.claimed && pledgedBigInt < goalBigInt;

  const isCampaignOpen = !currentCampaign.claimed;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/20 p-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
      <h2 className="text-3xl font-bold text-green-400 mb-2 glow-text">
        {currentCampaign.title}
      </h2>
      <p className="text-gray-400 mb-6">{currentCampaign.description}</p>

      <div className="mb-6">
        <ProgressBar
          goal={goalBigInt.toString()}
          current={pledgedBigInt.toString()}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
        <div>
          <div className="text-sm text-gray-400">Goal</div>
          <div className="text-lg font-bold text-green-400">
            {ethers.formatEther(goalBigInt)} ETH
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Pledged</div>
          <div className="text-lg font-bold text-white">
            {ethers.formatEther(pledgedBigInt)} ETH
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Deadline</div>
          <div className="text-lg font-bold text-white">
            {new Date(
              Number(currentCampaign.deadline) * 1000
            ).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Status</div>
          <div
            className={`text-lg font-bold ${
              isCampaignOpen ? "text-green-400" : "text-red-400"
            }`}
          >
            {isCampaignOpen ? "Active" : "Closed"}
          </div>
        </div>
      </div>

      {isCreator && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {canClaim && (
            <button
              onClick={handleClaimFunds}
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 bg-sky-500/90 hover:bg-sky-400/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)]"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>{loading ? "Claiming..." : "Claim Funds"}</span>
            </button>
          )}
          {canCallOff && (
            <button
              onClick={handleCallOff}
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 bg-red-600/90 hover:bg-red-500/90 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              <span>{loading ? "Calling Off..." : "Call Off Campaign"}</span>
            </button>
          )}
        </div>
      )}

      {isCampaignOpen && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold text-green-400 glow-text">
            Fund this campaign
          </h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
            className="w-full bg-gray-900 border border-green-500/20 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200"
            min="0"
            step="0.001"
          />
          <button
            onClick={handleFund}
            disabled={loading || !amount || Number(amount) <= 0}
            className="w-full flex justify-center items-center space-x-2 bg-green-600/90 hover:bg-green-500/90 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Funding...</span>
              </>
            ) : (
              "Fund Campaign"
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
