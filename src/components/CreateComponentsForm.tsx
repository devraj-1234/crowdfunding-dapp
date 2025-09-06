"use client";

import CrowdFundABI from "../contracts/CrowdFundABI.json";
import { Eip1193Provider } from "ethers";
import { useState } from "react";
import { createCampaign } from "../lib/contractUtils";
import { ethers } from "ethers";
import { addCampaign, updateCampaignChainId } from "../lib/firebase";
import { Log } from "ethers";
import { Sparkles, XCircle, CheckCircle } from "lucide-react";

export default function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const inputClasses =
    "w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-200";

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
        className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl"
      >
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Sparkles className="text-yellow-500" size={24} />
              Launch New Campaign
            </h2>
            <p className="text-gray-500">
              Share your vision and start gathering support today.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Campaign Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClasses}
                placeholder="Enter campaign title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClasses} min-h-[120px] resize-y`}
                placeholder="Describe your campaign's goals and vision"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Funding Goal
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className={`${inputClasses} pl-12`}
                    placeholder="0.0"
                    step="0.01"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-500 font-mono">
                    ETH
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-sm font-medium mb-2">
                  Duration
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className={`${inputClasses} pl-14`}
                    placeholder="30"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-500 font-mono">
                    Days
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 px-6 rounded-full font-semibold 
              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] 
              active:scale-[0.98] shadow-lg hover:shadow-xl"
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
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="text-white" size={20} />
                <span>Launch Campaign</span>
              </div>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}