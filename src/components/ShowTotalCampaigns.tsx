"use client";

import { useState, useEffect } from "react";
import { testContractRead } from "../lib/contractUtils";
import { Target } from "lucide-react";

export default function ShowTotalCampaigns() {
  const [totalCampaigns, setTotalCampaigns] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTotal() {
      try {
        const contract = await testContractRead(); 
        if (contract !== undefined) {
          setTotalCampaigns(contract);
        }
      } catch {
        setError("Error reading campaigns count");
      }
    }
    fetchTotal();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {error ? (
        <div className="text-red-500 text-sm flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      ) : totalCampaigns !== null ? (
        <div className="flex flex-col items-center justify-center">
          <Target className="text-green-500 mx-auto mb-3 animate-pulse" size={32} />
          <div className="text-2xl font-bold text-gray-800 mb-1">{totalCampaigns}</div>
          <div className="text-gray-600 text-sm">Total Campaigns</div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-base">Loading...</span>
        </div>
      )}
    </div>
  );
}