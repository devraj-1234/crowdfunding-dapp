"use client";

import { useState } from "react";
import CampaignList from "@/components/CampaignList";
import CampaignDetails from "@/components/CampaignDetails";
import CreateCampaignForm from "@/components/CreateComponentsForm";
import Hero from "@/components/Hero";
import type { Campaign } from "@/types/campaign";
import { Sparkles, ChevronLeft } from "lucide-react";

export default function Home() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="min-h-screen">
      <main className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {!selectedCampaign && !showCreateForm && <Hero />}

          {selectedCampaign ? (
            <div>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="mb-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 group bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="font-medium">Back to Campaigns</span>
              </button>
              <CampaignDetails campaign={selectedCampaign} />
            </div>
          ) : showCreateForm ? (
            <div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="mb-6 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 group bg-white rounded-full px-4 py-2 shadow-md hover:shadow-lg"
              >
                <ChevronLeft className="w-5 h-5 transform transition-transform duration-300 group-hover:-translate-x-1" />
                <span className="font-medium">Back to Campaigns</span>
              </button>
              <CreateCampaignForm />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-lg"
                >
                  <Sparkles className="animate-spin" size={20} />✨ Start Your
                  Dream Campaign ✨
                </button>
              </div>
              <CampaignList onCampaignSelect={setSelectedCampaign} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
