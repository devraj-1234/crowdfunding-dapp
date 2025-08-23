"use client";

import { useState, useEffect } from "react";
import { testContractRead } from "../lib/contractUtils";

export default function ShowTotalCampaigns() {
  const [totalCampaigns, setTotalCampaigns] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTotal() {
      try {
        const contract = await testContractRead(); // we will modify testContractRead to return value
        if (contract !== undefined) {
          setTotalCampaigns(contract);
        }
      } catch (err) {
        setError("Error reading campaigns count");
      }
    }
    fetchTotal();
  }, []);

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {totalCampaigns !== null ? (
        <p>Total campaigns on blockchain: {totalCampaigns}</p>
      ) : (
        <p>Loading total campaigns...</p>
      )}
    </div>
  );
}
