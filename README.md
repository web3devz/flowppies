

# Flowppies - AI-Generated NFT Pets on Flow Blockchain

<img width="959" alt="01" src="https://github.com/user-attachments/assets/a92a489b-4931-4674-b4b3-3578006eea0b" />


## 🌟 Overview

Flowppies is an innovative Web3 gaming platform that combines AI-generated NFT pets with interactive gameplay on the Flow blockchain. Users can create, train, and battle unique digital companions in a gasless environment powered by Flow's native VRF (Verifiable Random Function) and sponsored transaction system.

[**Live Site**](https://youtu.be/ySc6bvE_udw?si=YxUf_0wS_j7Ircw0)
[**Demo Video**](https://flowppies-rosy.vercel.app/)
[**Evolve Pet Endpoint**](https://floppies-evolution.onrender.com/evolve-pet)

## ✨ Key Features

### 🎨 AI-Powered Pet Generation

- **AI Image Creation**: Powered by Google's Gemini 2.0 Flash with advanced image generation capabilities
- **Custom Art Styles**: Choose from multiple styles including Pixel Art, Watercolor, 3D Render, Anime, and more
- **Dynamic Backstories**: AI-generated lore that evolves with your pet's journey
- **Unique Attributes**: Each pet has distinctive traits including Happiness, Power, Level, and Multiplier stats


### 🎲 Flow's Native VRF Integration

Token Tails uses Flow's Verifiable Random Function (VRF)  - a feature exclusive to Flow blockchain.

**How It Works:**

- **Battle Outcomes**: 70% pet stats + 30% cryptographic randomness
- **Zero Cost**: Free randomness (costs \$10+ on other chains)
- **Instant Results**: No waiting for oracles
- **Provably Fair**: Mathematical proof of fairness

  

**Implementation:**

```
// Get random number from Flow's native VRF
(bool ok, bytes memory data) = cadenceArch.staticcall(
    abi.encodeWithSignature("revertibleRandom()")
);
uint64 randomNumber = abi.decode(data, (uint64));

// Calculate fair battle outcome
uint256 pet1Power = pet1Stats + (randomNumber % 1000);
uint256 pet2Power = pet2Stats + ((randomNumber / 1000) % 1000);
```


### ⚡ Gasless Experience

- **Sponsored Transactions**: All gas fees covered by Flow Wallet
- **Seamless Onboarding**: No need to acquire native tokens for new users
- **Ultra-Low Costs**: When fees apply, they're minimal on Flow EVM


### 🏆 Interactive Gameplay

- **Pet Training**: Feed and train pets to increase their stats
- **Battle System**: Engage in PvP battles with stake-based rewards
- **Evolution Mechanics**: Level up pets to unlock new abilities and appearances
- **Leaderboard**: Compete for top rankings based on pet performance

  
  <img width="736" alt="03" src="https://github.com/user-attachments/assets/8fb4e4d3-b8e7-4cbe-8c14-f231acf81f37" />


## 🏗️ Technical Architecture

### Frontend Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS for responsive design
- **Web3 Integration**: RainbowKit with wagmi for wallet connectivity
- **UI Components**: Custom components with Framer Motion animations


### Blockchain Infrastructure

- **Network**: Flow Testnet \& Mainnet
- **Smart Contracts**: Solidity-based ERC721 implementation with custom battle mechanics
- **VRF Integration**: Flow's native randomness beacon for fair randomness 
- **Gas Sponsorship**: Flow Wallet's automatic fee coverage


### Storage \& AI

- **Decentralized Storage**: Irys Network for NFT metadata and images
- **AI Generation**: Google Gemini 2.0 Flash for image and backstory creation
- **Metadata Standards**: ERC721-compliant with evolving attributes


### Project Stack Overview


| Category | Component | Details |
| :-- | :-- | :-- |
| Frontend Stack | Framework | Next.js 14 with React 18 |
| Frontend Stack | Styling | Tailwind CSS for responsive design |
| Frontend Stack | Web3 Integration | RainbowKit with wagmi for wallet connectivity |
| Frontend Stack | UI Components | Custom components with Framer Motion animations |
| Blockchain Infrastructure | Network | Flow Testnet \& Mainnet |
| Blockchain Infrastructure | Smart Contracts | Solidity-based ERC721 implementation with custom battle mechanics |
| Blockchain Infrastructure | VRF Integration | Flow's native randomness beacon for fair battle outcomes |
| Blockchain Infrastructure | Gas Sponsorship | Flow Wallet's automatic fee coverage |
| Storage \& AI | Decentralized Storage | Irys Network for NFT metadata and images |
| Storage \& AI | AI Generation | Google Gemini 2.0 Flash for image and backstory creation |
| Storage \& AI | Metadata Standards | ERC721-compliant with evolving attributes |

### Project Architecture 

![WhatsApp Image 2025-07-06 at 03 24 26_f103800a](https://github.com/user-attachments/assets/3c2b9e10-f7e5-4bb3-9ba8-a8406686549b)


## 🎮 How to Play

### 1. Connect Your Wallet

- Install Flow Wallet extension
- Connect to the application
- All transaction fees are automatically sponsored!


### 2. Create Your Pet

- Navigate to the Generate page
- Describe your desired pet
- Choose an art style
- Let AI generate your unique companion

  <img width="724" alt="02" src="https://github.com/user-attachments/assets/75bd09c2-8b7f-4ae1-bc72-0aaa6d89a380" />



### 3. Train and Care

- Feed your pet to increase Happiness (+5) and Power (+1)
- Train your pet for enhanced Power (+5) and Happiness (+1)
- Watch your pet's multiplier grow with each interaction

  <img width="440" alt="04" src="https://github.com/user-attachments/assets/fb8cd034-1dab-40b8-90aa-568311487b3e" />



### 4. Battle Other Pets

- Create battles between any two pets
- Stake Flow tokens on your favorite
- Outcomes determined by 70% stats + 30% Flow VRF randomness
- Winners receive rewards distributed automatically


### 5. Evolution System

- Level up pets when they reach sufficient points
- Unlock new backstory chapters
- Enhance visual appearance and abilities


## 📁 Project Structure

```
flowppies/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── generate-backstory/   # AI backstory generation
│   │   ├── image/                # Gemini image generation
│   │   └── irys/                 # Decentralized storage
│   ├── components/               # React components
│   ├── battle/                   # Battle interface
│   ├── generate/                 # Pet creation
│   ├── showcase/                 # NFT gallery
│   └── leaderboard/              # Rankings
├── contract/                     # Smart contracts
│   └── DynamicNFT.sol           # Main NFT contract
├── utils/                        # Utilities and configs
└── lib/                          # Shared libraries
```


## 🔧 Smart Contract Features

### Core NFT Functionality

- **ERC721 Standard**: Full NFT compliance with metadata storage
- **Dynamic Attributes**: Stats that change based on interactions
- **Mutable Metadata**: Evolving backstories and characteristics
- **Ownership Tracking**: Secure pet ownership and transfer


### Battle System

- **Battle Creation**: Any user can create battles between pets
- **Stake Management**: Users can stake Flow tokens on battle outcomes
- **VRF Resolution**: Cryptographically fair battle resolution
- **Reward Distribution**: Automatic payout to winners (60% to stakers, 30% to creator, 10% to platform)


### Gas Optimization

- **Efficient Minting**: Optimized contract deployment and execution
- **Batch Operations**: Support for multiple actions in single transactions
- **Event Logging**: Comprehensive event emission for frontend tracking


## 🌐 Live Demo

- **Application**: [Deployed on Vercel](https://flowppies-rosy.vercel.app)



## 📊 Key Statistics

- **Zero Gas Fees**: All transactions sponsored by Flow Wallet
- **Instant Randomness**: No oracle delays for battle resolution
- **Scalable**: Flow's architecture supports high-throughput gaming
- **Decentralized Storage**: All metadata stored on Irys/IPFS


## 🔒 Security Features

- **Verifiable Randomness**: Cryptographically secure battle outcomes
- **Immutable Ownership**: Blockchain-secured pet ownership
- **Decentralized Metadata**: No single point of failure for pet data
- **Audited Libraries**: Built on OpenZeppelin's secure contracts


## 🌟 Why Flow Blockchain?

### Developer Benefits

- **Native VRF**: Built-in randomness without external oracles
- **Gas Sponsorship**: Eliminate user friction with sponsored transactions
- **High Performance**: Designed for mainstream adoption and gaming
- **EVM Compatibility**: Deploy Solidity contracts seamlessly


### User Benefits

- **No Gas Worries**: Play without managing native tokens
- **Instant Transactions**: Fast block times and finality
- **Fair Gameplay**: Provably random battle outcomes
- **True Ownership**: Decentralized NFT storage and metadata



## 🎯 Target Audience

- **Web3 Gamers**: Users seeking engaging blockchain-based gaming experiences
- **NFT Collectors**: Collectors interested in unique, evolving digital assets
- **AI Enthusiasts**: Users fascinated by AI-generated content and narratives


# 🚀 Flowppies Setup \& Installation Guide

## 📋 Prerequisites

Before setting up Flowppies, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) 
- **npm** or **yarn** package manager
- **Git** 
- **Flow Wallet** browser extension 


## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/web3devz/flowppies.git
cd flowppies
```


### 2. Install Dependencies

Choose your preferred package manager:

#### Using npm:

```bash
npm install
```


#### Using yarn:

```bash
yarn install
```


### 3. Environment Configuration

Create a `.env` file in the root directory and add the following environment variables:

```env
# Required: Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Required: Private key for contract deployment and Irys uploads
PRIVATE_KEY=your_private_key_for_contract_deployment

# Optional: Project name (defaults to "Flowppies")
NEXT_PUBLIC_PROJECT_NAME=project_name

```

### 4. Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev

```




