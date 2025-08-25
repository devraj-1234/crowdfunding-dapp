"use client";

import { useState } from "react";
import { Campaign } from "@/types/campaign";
import { BrowserProvider, Contract, parseEther } from "ethers";

interface Props {
  campaign: Campaign;
  onBack: () => void;
  contractAddress: string;
  contractAbi: readonly object[];
}

export default function CampaignDetails({
  campaign,
  onBack,
  contractAddress,
  contractAbi,
}: Props) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState<string | null>(null);

  async function fundCampaign() {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    // Convert campaign.id (string) to number to match uint32 expected by contract
    const campaignIdNumeric = Number(campaign.id);
    if (Number.isNaN(campaignIdNumeric)) {
      setTxStatus("Error: Campaign ID is not a valid number");
      return;
    }

    try {
      setTxStatus("Waiting for transaction confirmation...");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const tx = await contract.fundCampaign(campaignIdNumeric, {
        value: parseEther(amount),
      });
      await tx.wait();
      setTxStatus("Funding successful!");
      setAmount("");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        setTxStatus(`Error: ${(err as { message?: string }).message}`);
      } else {
        setTxStatus(`Error: ${String(err)}`);
      }
    }
  }

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: "1em" }}>
        &larr; Back to Campaigns
      </button>

      <h2>{campaign.title}</h2>
      <p>{campaign.description}</p>
      <p>
        <strong>Goal:</strong> {campaign.goal.toString()}
      </p>
      <p>
        <strong>Pledged:</strong> {campaign.pledged.toString()}
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {new Date(campaign.deadline * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Creator:</strong> {campaign.creator}
      </p>
      <p>
        <strong>Claimed:</strong> {campaign.claimed ? "Yes" : "No"}
      </p>

      <div style={{ marginTop: "2em" }}>
        <h3>Fund this campaign</h3>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: "1em", padding: "0.5em", width: "150px" }}
        />
        <button
          onClick={fundCampaign}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          Fund
        </button>
        {txStatus && <p>{txStatus}</p>}
      </div>
    </div>
  );
}
