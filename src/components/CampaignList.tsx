"use client";

import { useState, useEffect } from "react";
import { getCampaigns } from "../lib/firebase";
import { Campaign } from "@/types/campaign";
import CampaignDetails from "./CampaignDetails";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";

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
        <div>
          <p>Campaign not found!</p>
          <button onClick={() => setSelectedCampaignId(null)}>
            Back to Campaigns
          </button>
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

  if (!campaigns.length) return <p>No campaigns found.</p>;

  return (
    <div>
      <h2>All Campaigns</h2>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {campaigns.map((c) => (
          <li
            key={c.id}
            style={{
              margin: "1em 0",
              padding: "1em",
              border: "1px solid #eee",
              cursor: "pointer",
              borderRadius: 4,
              backgroundColor: "#fafafa",
              transition: "background-color 0.2s ease",
            }}
            onClick={() => setSelectedCampaignId(c.id!)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f0f0f0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#fafafa")
            }
          >
            <strong>{c.title}</strong>
            <div>{c.description}</div>
            <div>
              <strong>Goal:</strong> {c.goal.toString()}
            </div>
            <div>
              <strong>Creator:</strong> {c.creator}
            </div>
            <div>
              <strong>Claimed:</strong> {c.claimed ? "Yes" : "No"}
            </div>
            <div>
              <strong>Pledged:</strong> {c.pledged.toString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
