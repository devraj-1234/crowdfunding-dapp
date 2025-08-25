// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

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
      ...data,
      creator: data.creator,
      title: data.title,
      description: data.description,
      goal: data.goal,         // convert string to bigint
      pledged: data.pledged,   // convert string to bigint
      deadline: Number(data.deadline),
      claimed: Boolean(data.claimed),
    };
  });
};

export const addCampaign = async (campaign: Campaign) => {
  return await addDoc(collection(db, "campaigns"), campaign);
};
