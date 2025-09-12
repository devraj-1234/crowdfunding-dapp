# HeartFund - Decentralized Crowdfunding3. Create a `.env.local` file in the root directory with your Firebase and contract configurations:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Smart Contract

The project uses a custom Crowdfunding smart contract that handles:

- Campaign creation
- Donation processing
- Fund withdrawal by campaign owners
- Campaign cancellation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.rm

HeartFund is a blockchain-based crowdfunding platform that enables transparent, secure, and direct funding for charitable and social impact projects. Built with Next.js, Ethers.js, and Firebase, HeartFund connects donors directly with campaign creators, eliminating intermediaries and ensuring that funds reach their intended recipients.

## Features

- **Blockchain-Based Donations**: Make secure donations using cryptocurrency
- **Transparent Fund Tracking**: All transactions are recorded on the blockchain
- **Campaign Creation**: Anyone can create a campaign to raise funds
- **Donor Recognition**: View all donors who have contributed to campaigns
- **Campaign Status Tracking**: Track campaign progress and fund distribution

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Blockchain Interaction**: Ethers.js, Web3.js
- **Authentication & Database**: Firebase
- **Smart Contract**: Solidity (Ethereum)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MetaMask wallet extension
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/crowdfunding-dapp.git
cd crowdfunding-dapp
```

2. Install dependencies:

```bash
npm install
```

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
