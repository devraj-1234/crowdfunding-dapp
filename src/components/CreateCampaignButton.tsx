"use client";

interface CreateCampaignButtonProps {
  onClick: () => void;
}

export default function CreateCampaignButton({
  onClick,
}: CreateCampaignButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-4 
        shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]
        transform transition-all duration-300 hover:scale-110 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
        border border-blue-500/50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}