// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";

import firebaseConfig from "../../config/firebaseConfig.json"; 
// adjust path if needed

import { Campaign } from "../types/campaign";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Example helper functions
export const getCampaigns = async () => {
  const querySnapshot = await getDocs(collection(db, "campaigns"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      creator: data.creator,
      title: data.title,
      description: data.description,
      goal: data.goal,
      pledged: data.pledged,
      deadline: Number(data.deadline),
      claimed: Boolean(data.claimed),
      chainId: data.chainId, // Explicitly include chainId
    };
  });
};

export const addCampaign = async (campaign: Campaign) => {
  return await addDoc(collection(db, "campaigns"), campaign);
};

export async function updateCampaignChainId(docId: string, chainId: number) {
  const campaignRef = doc(db, "campaigns", docId);
  await updateDoc(campaignRef, { chainId });
}

export async function updatePledgedAmount(
  docId: string,
  newPledgedAmount: string
) {
  const campaignRef = doc(db, "campaigns", docId);
  await updateDoc(campaignRef, { pledged: newPledgedAmount });
}

export async function updateCampaignClaimedStatus(docId: string) {
  const campaignRef = doc(db, "campaigns", docId);
  await updateDoc(campaignRef, { claimed: true });
}