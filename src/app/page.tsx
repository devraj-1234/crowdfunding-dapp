"use client";

import { useState } from "react";
import CampaignList from "@/components/CampaignList";
import CampaignDetails from "@/components/CampaignDetails";
import CreateCampaignForm from "@/components/CreateComponentsForm";
import WalletConnect from "@/components/WalletConnect";
import { Campaign } from "@/types/campaign";

export default function Home() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 md:p-8 relative">
      <div
        className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"
        style={{ zIndex: 0 }}
      ></div>
      <div className="relative z-10">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-400 glow-text">
            Crowdfund DApp
          </h1>
          <WalletConnect />
        </header>

        <div className="w-full max-w-7xl mx-auto">
          {selectedCampaign ? (
            <div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="mb-6 inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-200 group glow-text-hover"
              >
                <svg
                  className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1"
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
              <CampaignDetails campaign={selectedCampaign} />
            </div>
          ) : showCreateForm ? (
            <div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="mb-6 inline-flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors duration-200 group glow-text-hover"
              >
                <svg
                  className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1"
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
              <CreateCampaignForm />
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all duration-300"
                >
                  + Create Campaign
                </button>
              </div>
              <CampaignList onCampaignSelect={setSelectedCampaign} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
