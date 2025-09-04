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
    return Number(totalCampaigns);
  } catch (err) {
    console.error("Error reading from contract:", err);
  }
}

export async function createCampaign(
  title: string,
  description: string,
  goal: bigint,
  durationInDays: number
) {
  const contract = await getContract();
  if (!contract) throw new Error("Smart contract not loaded");
  const tx = await contract.createCampaign(title, description, goal, durationInDays);
  //await tx.wait(); // wait for transaction to confirm
  return tx;
}

export async function sendFundsToCampaign(campaignId: number, amount: bigint) {
  const contract = await getContract();
  if (!contract) {
    console.log("Smart contract not loaded");
    throw new Error("Smart contract not loaded");
  }
  else
  {
    console.log("Smart contract loaded!");
  }
  // Using the same pattern as in the previously working code
  const tx = await contract.fundCampaign(campaignId, {
    value: amount
  });
  return tx;
}

export async function claimFunds(campaignId: number) {
  const contract = await getContract();
  if (!contract) {
    console.log("Smart contract not loaded");
    throw new Error("Smart contract not loaded");
  }
  else {
    console.log("Smart contract loaded for claiming funds!");
  }
  // Using the same pattern as in the previously working code
  const tx = await contract.claimFunds(campaignId);
  return tx;
}

export async function callOffCampaign(campaignId: number) {
  const contract = await getContract();
  if (!contract) {
    console.log("Smart contract not loaded");
    throw new Error("Smart contract not loaded");
  }
  else {
    console.log("Smart contract loaded for calling off campaign!");
  }
  // Using the same pattern as in the previously working code
  const tx = await contract.callOffCampaign(campaignId);
  return tx;
}
