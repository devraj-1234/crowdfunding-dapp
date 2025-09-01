"use client";

import { useState } from "react";
import WalletConnect from "../components/WalletConnect";
import ShowTotalCampaigns from "@/components/ShowTotalCampaigns";
import CreateCampaignForm from "@/components/CreateComponentsForm";
import CampaignList from "@/components/CampaignList";
import CreateCampaignButton from "@/components/CreateCampaignButton";

export default function Home() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="relative">
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Crowdfunding DApp</h1>
              <p className="text-gray-400">Support innovative projects with cryptocurrency</p>
            </div>
            <div className="flex items-center space-x-4">
              <ShowTotalCampaigns />
              <WalletConnect />
            </div>
          </div>
        </div>
        </div>
      </div>

      <CampaignList />
      
      {showCreateForm ? (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl border border-green-500/20 shadow-[0_0_25px_rgba(34,197,94,0.2)] max-w-lg w-full p-8 relative animate-gradient">
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-green-400 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <CreateCampaignForm />
          </div>
        </div>
      ) : (
        <CreateCampaignButton onClick={() => setShowCreateForm(true)} />
      )}
    </main>
  );
}
