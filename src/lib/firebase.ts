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
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const addCampaign = async (campaign: Campaign) => {
  return await addDoc(collection(db, "campaigns"), campaign);
};
