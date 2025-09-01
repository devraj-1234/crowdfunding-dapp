"use client";

import CrowdFundABI from "../contracts/CrowdFundABI.json";

import { Eip1193Provider } from "ethers";
import { useState } from "react";
import { createCampaign } from "../lib/contractUtils";
import { ethers } from "ethers";
import { addCampaign, updateCampaignChainId } from "../lib/firebase";
import { Log } from "ethers";

export default function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClasses =
    "w-full bg-gray-800 border border-green-500/20 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all duration-200";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description || !goal || !duration) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(Number(goal)) || isNaN(Number(duration))) {
      setError("Goal and duration must be valid numbers.");
      return;
    }

    interface EthereumWithSelectedAddress extends Eip1193Provider {
      selectedAddress?: string;
    }

    const eth =
      typeof window !== "undefined"
        ? (window.ethereum as EthereumWithSelectedAddress)
        : undefined;

    const creatorAddress = eth?.selectedAddress
      ? eth.selectedAddress.toLowerCase()
      : "";

    try {
      setLoading(true);
      const goalBigInt = ethers.parseEther(goal);
      const durationNumber = parseInt(duration, 10);

      const tx = await createCampaign(
        title,
        description,
        goalBigInt,
        durationNumber
      );
      await tx.wait(); // wait for confirmation

      const currentTimestampSeconds = Math.floor(Date.now() / 1000);
      const campaignDeadline = currentTimestampSeconds + durationNumber * 86400;

      // Prepare metadata to save to Firebase
      const campaignMetadata = {
        creator: creatorAddress,
        title,
        description,
        goal: goalBigInt.toString(),
        deadline: campaignDeadline,
        pledged: "0",
        claimed: false,
        // Add any other relevant data you want to store off-chain
      };

      const docRef = await addCampaign(campaignMetadata);
      const docId = docRef.id;
      const receipt = await tx.wait();

      if (receipt) {
        // The modern way to parse events from a transaction receipt
        const iface = new ethers.Interface(CrowdFundABI);
        const campaignCreatedLog = receipt.logs
          .map((log: Log) => {
            try {
              // Attempt to parse the log with our contract's interface
              return iface.parseLog(log);
            } catch {
              // This log is not from our contract, or not one of its events
              return null;
            }
          })
          .find(
            (log: ethers.LogDescription | null) =>
              log?.name === "CampaignCreated"
          );

        if (campaignCreatedLog && campaignCreatedLog.args) {
          const campaignId = Number(campaignCreatedLog.args[0]);
          await updateCampaignChainId(docId, campaignId);
        } else {
          console.warn(
            "CampaignCreated event not found in transaction receipt; chainId not updated"
          );
        }
      } else {
        console.error("Transaction receipt not found.");
      }

      setSuccess("Campaign created successfully!");
      setTitle("");
      setDescription("");
      setGoal("");
      setDuration("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-green-500/20 p-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-green-400 mb-2 glow-text">
              Create New Campaign
            </h2>
            <p className="text-gray-400">
              Launch your crowdfunding project on the blockchain
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-green-400 text-sm font-medium mb-2 flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Campaign Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`${inputClasses} hover:border-green-500/40`}
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div>
              <label className="block text-green-400 text-sm font-medium mb-2 flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
                <span>Description</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClasses} min-h-[120px] resize-y hover:border-green-500/40`}
                placeholder="Describe your campaign's goals and vision"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-green-400 text-sm font-medium mb-2 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Funding Goal</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={`${inputClasses} pl-12 hover:border-green-500/40`}
                    placeholder="0.0"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-green-500 font-mono">
                    ETH
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-medium mb-2 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Duration</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`${inputClasses} pl-14 hover:border-green-500/40`}
                    placeholder="30"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-green-500 font-mono">
                    Days
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600/90 hover:bg-green-500/90 text-white py-4 px-6 rounded-lg font-semibold 
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] 
              active:scale-[0.98] shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]
              backdrop-blur-sm border border-green-400/20 hover:border-green-400/40"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
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
                <span>Creating Campaign...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Launch Campaign</span>
              </div>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-400 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-400 text-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
