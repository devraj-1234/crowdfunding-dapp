// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";

// Use environment variables instead of direct import for GitHub
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

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