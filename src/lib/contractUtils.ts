import { getContract } from "./web3";

export async function testContractRead() {
  const contract = await getContract();
  if (!contract) {
    console.error("MetaMask not found or contract not loaded");
    return;
  }

  try {
    // Example: read total campaigns from your crowdfunding contract
    const totalCampaigns: bigint = await contract.campaignCount();
    console.log("Total campaigns:", totalCampaigns.toString());
  } catch (err) {
    console.error("Error reading from contract:", err);
  }
}
