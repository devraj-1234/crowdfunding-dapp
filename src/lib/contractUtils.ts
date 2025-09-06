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

export async function getDonorsFromMapping(campaignId: number): Promise<{ donor: string; amount: string }[]> {
  const contract = await getContract();
  if (!contract) {
    console.log("Smart contract not loaded");
    throw new Error("Smart contract not loaded");
  }

  try {
    // Unfortunately, Solidity doesn't provide a way to get all keys from a mapping directly
    // First fetch all Funded events and then filter them client-side
    // We use null in the filter to get all Funded events without filtering by campaignId
    const filter = contract.filters.Funded(null);
    const events = await contract.queryFilter(filter);
    
    // Get unique donor addresses from events, filtering by campaign ID in memory
    const uniqueDonors = new Set<string>();
    
    events.forEach(event => {
      // Type guard to check if this is an EventLog with args property
      if ('args' in event && event.args && typeof event.args === 'object') {
        // First check if this event is for our campaign
        const eventId = 'id' in event.args ? event.args.id : (Array.isArray(event.args) ? event.args[0] : null);
        if (!eventId || Number(eventId) !== campaignId) return;
        
        // Then get the contributor address
        const contributor = 'contributor' in event.args 
          ? event.args.contributor as string
          : Array.isArray(event.args) && event.args.length >= 2 
            ? event.args[1] as string 
            : null;
            
        if (contributor) {
          uniqueDonors.add(contributor);
        }
      }
    });
    
    // Query the contributions mapping for each donor
    const donors: { donor: string; amount: string }[] = [];
    for (const donorAddress of uniqueDonors) {
      const amount = await contract.contributions(campaignId, donorAddress);
      if (amount > 0) {
        donors.push({
          donor: donorAddress,
          amount: amount.toString()
        });
      }
    }
    
    return donors;
  } catch (err) {
    console.error("Error fetching donors from mapping:", err);
    return [];
  }
}

// Keeping this for backward compatibility, but we're using getDonorsFromMapping now
export async function getDonors(campaignId: number): Promise<{ donor: string; amount: string }[]> {
  const contract = await getContract();
  if (!contract) {
    console.log("Smart contract not loaded");
    throw new Error("Smart contract not loaded");
  }

  try {
    // Use null to get all events and filter in memory
    const filter = contract.filters.Funded(null);
    const events = await contract.queryFilter(filter);

    const donorContributions: { [key: string]: bigint } = {};

    events.forEach(event => {
      if ('args' in event && event.args && typeof event.args === 'object') {
        // First check if this event is for our campaign
        const eventId = 'id' in event.args ? event.args.id : (Array.isArray(event.args) ? event.args[0] : null);
        if (!eventId || Number(eventId) !== campaignId) return;
        
        // Then handle the donor and amount data
        const contributor = 'contributor' in event.args 
          ? event.args.contributor as string
          : Array.isArray(event.args) && event.args.length >= 2 
            ? event.args[1] as string 
            : null;
            
        const amount = 'amount' in event.args 
          ? event.args.amount as bigint
          : Array.isArray(event.args) && event.args.length >= 3 
            ? event.args[2] as bigint 
            : null;

        if (contributor && amount) {
          donorContributions[contributor] = (donorContributions[contributor] || 0n) + amount;
        }
      }
    });

    return Object.entries(donorContributions).map(([donor, amount]) => ({
      donor,
      amount: amount.toString(),
    }));

  } catch (err) {
    console.error("Error fetching donors:", err);
    return [];
  }
}
