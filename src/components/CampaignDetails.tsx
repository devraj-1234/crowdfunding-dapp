"use client";

import { useState } from "react";
import { Campaign } from "@/types/campaign";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { updatePledgedAmount } from "@/lib/firebase";

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
  const [currentCampaign, setCurrentCampaign] = useState<Campaign>(campaign);

  async function fundCampaign() {
    if (!window.ethereum) {
      alert("MetaMask is not installed");
      return;
    }

    // Use the on-chain campaign ID for the transaction
    const campaignIdNumeric = Number(currentCampaign.chainId);
    if (Number.isNaN(campaignIdNumeric)) {
      setTxStatus("Error: On-chain Campaign ID is missing or invalid.");
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

      // --- Update off-chain database ---
      const currentPledged = BigInt(currentCampaign.pledged);
      const newPledged = currentPledged + BigInt(parseEther(amount));
      if (currentCampaign.id) {
        await updatePledgedAmount(currentCampaign.id, newPledged.toString());
      }

      // --- Update local state for immediate UI feedback ---
      setCurrentCampaign({
        ...currentCampaign,
        pledged: newPledged.toString(),
      });
      // --- End of update ---

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

      <h2>{currentCampaign.title}</h2>
      <p>{currentCampaign.description}</p>
      <p>
        <strong>Goal:</strong> {formatEther(currentCampaign.goal)} ETH
      </p>
      <p>
        <strong>Pledged:</strong> {formatEther(currentCampaign.pledged)} ETH
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {new Date(currentCampaign.deadline * 1000).toLocaleString()}
      </p>
      <p>
        <strong>Creator:</strong> {currentCampaign.creator}
      </p>
      <p>
        <strong>Claimed:</strong> {currentCampaign.claimed ? "Yes" : "No"}
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
