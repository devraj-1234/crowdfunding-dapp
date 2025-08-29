"use client";

import CrowdFundABI from "../contracts/CrowdFundABI.json";

import { Eip1193Provider } from "ethers";
import { useState } from "react";
import { createCampaign } from "../lib/contractUtils";
import { ethers } from "ethers";
import { addCampaign, updateCampaignChainId } from "../lib/firebase";
import { Log } from "ethers";

export default function CreateCampaignForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !description || !goal || !duration) {
      setError("Please fill in all fields.");
      return;
    }

    if (isNaN(Number(goal)) || isNaN(Number(duration))) {
      setError("Goal and duration must be valid numbers.");
      return;
    }

    interface EthereumWithSelectedAddress extends Eip1193Provider {
      selectedAddress?: string;
    }

    const eth =
      typeof window !== "undefined"
        ? (window.ethereum as EthereumWithSelectedAddress)
        : undefined;

    const creatorAddress = eth?.selectedAddress
      ? eth.selectedAddress.toLowerCase()
      : "";

    try {
      setLoading(true);
      const goalBigInt = ethers.parseEther(goal);
      const durationNumber = parseInt(duration, 10);

      const tx = await createCampaign(
        title,
        description,
        goalBigInt,
        durationNumber
      );
      await tx.wait(); // wait for confirmation

      const currentTimestampSeconds = Math.floor(Date.now() / 1000);
      const campaignDeadline = currentTimestampSeconds + durationNumber * 86400;

      // Prepare metadata to save to Firebase
      const campaignMetadata = {
        creator: creatorAddress,
        title,
        description,
        goal: goalBigInt.toString(),
        deadline: campaignDeadline,
        pledged: "0",
        claimed: false,
        // Add any other relevant data you want to store off-chain
      };

      const docRef = await addCampaign(campaignMetadata);
      const docId = docRef.id;
      const receipt = await tx.wait();

      if (receipt) {
        // The modern way to parse events from a transaction receipt
        const iface = new ethers.Interface(CrowdFundABI);
        const campaignCreatedLog = receipt.logs
          .map((log: Log) => {
            try {
              // Attempt to parse the log with our contract's interface
              return iface.parseLog(log);
            } catch {
              // This log is not from our contract, or not one of its events
              return null;
            }
          })
          .find(
            (log: ethers.LogDescription | null) =>
              log?.name === "CampaignCreated"
          );

        if (campaignCreatedLog && campaignCreatedLog.args) {
          const campaignId = Number(campaignCreatedLog.args[0]);
          await updateCampaignChainId(docId, campaignId);
        } else {
          console.warn(
            "CampaignCreated event not found in transaction receipt; chainId not updated"
          );
        }
      } else {
        console.error("Transaction receipt not found.");
      }

      setSuccess("Campaign created successfully!");
      setTitle("");
      setDescription("");
      setGoal("");
      setDuration("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, marginTop: 20 }}>
      <h2>Create New Campaign</h2>
      <label>
        Title:
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Goal (ETH):
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Duration (days):
        <input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Campaign"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </form>
  );
}
