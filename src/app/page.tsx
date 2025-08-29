import WalletConnect from "../components/WalletConnect";
import ShowTotalCampaigns from "@/components/ShowTotalCampaigns";
import CreateCampaignForm from "@/components/CreateComponentsForm";
import CampaignList from "@/components/CampaignList";
//import CampaignDetails from "@/components/CampaignDetails";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Welcome to Crowdfunding DApp</h1>
      <p>Test your MetaMask wallet connection below:</p>
      <WalletConnect />
      <ShowTotalCampaigns />
      <CreateCampaignForm />
      <CampaignList />

    </main>
  );
}
