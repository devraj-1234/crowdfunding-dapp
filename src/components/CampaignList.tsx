"use client";

import { useState, useEffect } from "react";
import { getCampaigns } from "../lib/firebase";
import { Campaign } from "@/types/campaign";
import CampaignDetails from "./CampaignDetails";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import ProgressBar from "./ProgressBar";
import { formatEther } from "ethers";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch {
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  if (loading) return <p>Loading campaigns...</p>;

  if (selectedCampaignId) {
    const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
    if (!selectedCampaign) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-red-500/20 text-center">
            <p className="text-red-400 text-lg mb-4">Campaign not found!</p>
            <button
              onClick={() => setSelectedCampaignId(null)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg 
                transition-all duration-200 border border-green-500/20 hover:border-green-500/40
                flex items-center space-x-2 mx-auto group"
            >
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Back to Campaigns</span>
            </button>
          </div>
        </div>
      );
    }
    return (
      <CampaignDetails
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaignId(null)}
        contractAddress={CONTRACT_ADDRESS}
        contractAbi={CONTRACT_ABI}
      />
    );
  }

  if (!campaigns.length)
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 text-lg">No campaigns found.</p>
      </div>
    );

  // Separate campaigns into active and claimed
  const activeCampaigns = campaigns.filter((c) => !c.claimed && !c.calledOff);
  const claimedCampaigns = campaigns.filter((c) => c.claimed);

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
    <div
      key={campaign.id}
      onClick={() => setSelectedCampaignId(campaign.id!)}
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] border border-green-500/20 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] group relative z-10"
    >
      <div className="p-6">
        <h3 className="text-xl font-semibold text-green-400 mb-2 line-clamp-1 group-hover:text-green-300">
          {campaign.title}
        </h3>
        <p className="text-gray-400 mb-4 line-clamp-2">
          {campaign.description}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-500">Progress</span>
              <span className="text-gray-300 font-mono">
                {formatEther(campaign.pledged)} / {formatEther(campaign.goal)}{" "}
                ETH
              </span>
            </div>
            <ProgressBar current={campaign.pledged} goal={campaign.goal} />
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-400 flex items-center space-x-1">
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
              <span>
                {new Date(campaign.deadline * 1000).toLocaleDateString()}
              </span>
            </div>
            {campaign.claimed ? (
              <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-xs border border-green-500/50">
                Claimed
              </span>
            ) : campaign.calledOff ? (
              <span className="bg-red-900/50 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/50">
                Called Off
              </span>
            ) : (
              <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/50">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 px-6 py-4 border-t border-green-500/20">
        <div className="text-sm flex items-center space-x-2">
          <span className="text-green-500">Creator</span>
          <span className="font-mono text-xs text-gray-400 break-all">
            {campaign.creator}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Active Campaigns Section */}
      <section>
        <h2 className="text-3xl font-bold text-green-400 mb-8 glow-text flex items-center">
          Active Campaigns
          <span className="ml-3 text-lg bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/50">
            {activeCampaigns.length}
          </span>
        </h2>
        {activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">
            No active campaigns at the moment.
          </p>
        )}
      </section>

      {/* Claimed Campaigns Section */}
      {claimedCampaigns.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-green-400 mb-8 glow-text flex items-center">
            Claimed Campaigns
            <span className="ml-3 text-lg bg-green-900/50 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/50">
              {claimedCampaigns.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claimedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
