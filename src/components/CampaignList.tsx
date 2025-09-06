"use client";

import { useState, useEffect } from "react";
import { getCampaigns } from "../lib/firebase";
import { Campaign } from "@/types/campaign";
import ProgressBar from "./ProgressBar";
import { formatEther } from "ethers";

function CampaignCard({
  campaign,
  onSelect,
}: {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}) {
  return (
    <div
      onClick={() => onSelect(campaign)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-2xl relative z-10"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
          {campaign.title}
        </h3>
        <p className="text-gray-500 mb-4 line-clamp-2 text-sm">
          {campaign.description}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-800">
                {formatEther(campaign.pledged)} / {formatEther(campaign.goal)}{" "}
                ETH
              </span>
            </div>
            <ProgressBar
              goal={campaign.goal.toString()}
              current={campaign.pledged.toString()}
            />
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-500 flex items-center space-x-1">
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
              <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs">
                Closed
              </span>
            ) : (
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs">
                Active
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-6 py-4 border-t border-gray-200">
        <div className="text-xs flex items-center space-x-2">
          <span className="text-gray-500">Creator</span>
          <span className="font-mono text-gray-800 break-all">
            {campaign.creator}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CampaignList({
  onCampaignSelect,
}: {
  onCampaignSelect: (campaign: Campaign) => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return <p className="text-center text-gray-400">Loading campaigns...</p>;

  if (!campaigns.length)
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 text-lg">No campaigns found.</p>
      </div>
    );

  const activeCampaigns = campaigns.filter((c) => !c.claimed);
  const claimedCampaigns = campaigns.filter((c) => c.claimed);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-3">
          <span>Active Campaigns</span>
          <span className="text-sm bg-blue-100 text-blue-600 rounded-full px-3 py-1">
            {activeCampaigns.length}
          </span>
        </h2>
        {activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={onCampaignSelect}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active campaigns at the moment.</p>
        )}
      </section>

      {claimedCampaigns.length > 0 && (
        <section>
          <div className="border-t border-gray-200 my-12"></div>
          <h2 className="text-2xl font-bold text-gray-500 mb-4 flex items-center space-x-3">
            <span>Claimed & Called Off</span>
            <span className="text-sm bg-gray-200 text-gray-500 rounded-full px-3 py-1">
              {claimedCampaigns.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {claimedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSelect={onCampaignSelect}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}