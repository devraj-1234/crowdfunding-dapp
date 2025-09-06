"use client";

import { useEffect, useState, useCallback } from "react";
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
import {
  Heart,
  Shield,
  XCircle,
  CheckCircle,
  PiggyBank,
  Wallet,
} from "lucide-react";

interface Donor {
  address: string;
  amount: bigint;
}

export default function CampaignDetails({ campaign }: { campaign: Campaign }) {
  const [currentCampaign, setCurrentCampaign] = useState(campaign);
  const [isCreator, setIsCreator] = useState(false);
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("story");
  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    try {
      const { getDonorsFromMapping } = await import("../lib/contractUtils");

      const campaignIdNumeric = Number(
        currentCampaign.chainId || currentCampaign.id
      );

      if (isNaN(campaignIdNumeric)) {
        console.error("Invalid campaign ID for fetching donors.");
        return;
      }

      // Get donors directly from the contributions mapping
      const donorData = await getDonorsFromMapping(campaignIdNumeric);

      // Convert to Donor interface format
      const donorList: Donor[] = donorData.map(({ donor, amount }) => ({
        address: donor,
        amount: BigInt(amount),
      }));

      setDonors(donorList);
    } catch (err) {
      console.error("Error fetching donors:", err);
    }
  }, [currentCampaign.chainId, currentCampaign.id]);

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

  useEffect(() => {
    if (activeTab === "donors") {
      fetchDonors();
    }
  }, [activeTab, fetchDonors]);

  const handleFund = async () => {
    const parsedAmount = parseFloat(amount);
    if (!currentCampaign?.id || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid positive amount to fund.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amountToFund = parsedAmount.toString();
      const amountInWei = ethers.parseEther(amountToFund);
      const campaignIdNumeric = Number(
        currentCampaign.chainId || currentCampaign.id
      );
      const tx = await sendFundsToCampaign(campaignIdNumeric, amountInWei);
      await tx.wait();

      const newPledged = (
        BigInt(currentCampaign.pledged) + BigInt(amountInWei)
      ).toString();
      await updatePledgedAmount(currentCampaign.id, newPledged);

      setCurrentCampaign({ ...currentCampaign, pledged: newPledged });
      setSuccess("Thank you for your contribution!");
      setAmount("");
      // Refresh donors list after a successful funding
      fetchDonors();
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
      const tx = await claimFunds(campaignIdNumeric);
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
      const tx = await callOffCampaign(campaignIdNumeric);
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
  const progressPercentage =
    goalBigInt > 0 ? Number((pledgedBigInt * 100n) / goalBigInt) : 0;
  const daysRemaining = Math.max(
    0,
    Math.floor(
      (currentCampaign.deadline * 1000 - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const canClaim =
    isCreator && !currentCampaign.claimed && pledgedBigInt >= goalBigInt;

  const canCallOff =
    isCreator && !currentCampaign.claimed && pledgedBigInt < goalBigInt;
  const donateButtonStyle =
    "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg w-full";

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200">
      {/* Campaign Hero Section */}
      <div className="relative h-[350px] overflow-hidden rounded-t-3xl">
        <img
          src="/happy-children-learning-in-classroom-with-books-an.jpg" // Placeholder image URL
          alt={currentCampaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {currentCampaign.title.split(" ")[0]}
            </span>
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {progressPercentage}% Funded
            </span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-1">
            {currentCampaign.title}
          </h2>
          <p className="text-gray-200 text-sm">
            By {currentCampaign.creator.slice(0, 6)}...
            {currentCampaign.creator.slice(-4)}
          </p>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 text-center mb-8 bg-gray-50 p-6 rounded-2xl shadow-inner">
            <div>
              <div className="text-3xl font-extrabold text-blue-600">
                {ethers.formatEther(pledgedBigInt)}
              </div>
              <div className="text-sm text-gray-500">
                raised of {ethers.formatEther(goalBigInt)}
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">
                {donors.length}
              </div>
              <div className="text-sm text-gray-500">amazing donors</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-blue-600">
                {daysRemaining}
              </div>
              <div className="text-sm text-gray-500">days remaining</div>
            </div>
          </div>

          {/* Tabbed Interface */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("story")}
                className={`py-3 px-6 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "story"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Story 📖
              </button>
              <button
                onClick={() => setActiveTab("updates")}
                className={`py-3 px-6 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "updates"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Updates ✨
              </button>
              <button
                onClick={() => setActiveTab("donors")}
                className={`py-3 px-6 text-sm font-semibold transition-colors duration-200 ${
                  activeTab === "donors"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Donors ❤️
              </button>
            </div>

            <div className="p-6">
              {activeTab === "story" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Our Story 📖
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {currentCampaign.description}
                  </p>
                </div>
              )}
              {activeTab === "updates" && (
                <p className="text-gray-500 italic">
                  No updates yet. Check back soon!
                </p>
              )}
              {activeTab === "donors" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Donors ({donors.length})
                  </h3>
                  {donors.length > 0 ? (
                    <ul className="space-y-4">
                      {donors.map((donor, index) => (
                        <li
                          key={index}
                          className="bg-gray-50 p-4 rounded-xl shadow-inner flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet size={20} className="text-blue-500" />
                            <span className="font-mono text-sm text-gray-700 break-all">
                              {donor.address}
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-green-600">
                            {ethers.formatEther(donor.amount)} ETH
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">
                      No one has donated to this campaign yet. Be the first!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PiggyBank size={20} className="text-pink-500" />
              Fund this campaign
            </h3>
            <button
              onClick={() => setShowDonateForm(!showDonateForm)}
              className={donateButtonStyle}
            >
              <Heart size={20} />
              <span>Donate Now</span>
            </button>
            {showDonateForm && (
              <div className="mt-4">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all duration-200 mb-4"
                  min="0"
                  step="0.001"
                />
                <button
                  onClick={handleFund}
                  disabled={loading || !amount || Number(amount) <= 0}
                  className="w-full flex justify-center items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? "Funding..." : "Confirm Donation"}
                </button>
              </div>
            )}
            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <Shield size={16} className="text-green-500" />
                Secure blockchain transactions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-500" />
                100% transparent fund usage
              </li>
              <li className="flex items-center gap-2">
                <Heart size={16} className="text-pink-500" />
                Real-time impact tracking
              </li>
            </ul>
          </div>

          {/* Creator actions */}
          {isCreator && (
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200 space-y-4">
              <h3 className="text-xl font-bold text-gray-800">
                Creator Dashboard
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {canClaim && (
                  <button
                    onClick={handleClaimFunds}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white py-3 px-6 rounded-full font-semibold transition-all disabled:opacity-50 shadow-md"
                  >
                    {loading ? "Claiming..." : "Claim Funds"}
                  </button>
                )}
                {canCallOff && (
                  <button
                    onClick={handleCallOff}
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 bg-red-500 hover:bg-red-400 text-white py-3 px-6 rounded-full font-semibold transition-all disabled:opacity-50 shadow-md"
                  >
                    {loading ? "Calling Off..." : "Call Off Campaign"}
                  </button>
                )}
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}
