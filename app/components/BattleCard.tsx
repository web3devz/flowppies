"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Battle, Pet } from '../types/battle';


interface BattleCardProps {
  battle: Battle;
  pets: Pet[];
  walletClient: any;
  contractAddress: string;
  abi: any;
  onBattleUpdate: () => void;
}

export default function BattleCard({ battle, pets, walletClient, contractAddress, abi, onBattleUpdate }: BattleCardProps) {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  
  // Separate loading states - THIS IS THE KEY FIX
  const [stakeLoading, setStakeLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);

  const isCreator = address?.toLowerCase() === battle.creator.toLowerCase();
  const battleEnded = !battle.active;
  const pet1Stakes = ethers.formatEther(battle.totalStakePet1);
  const pet2Stakes = ethers.formatEther(battle.totalStakePet2);

  // Find pet details
  const pet1Details = pets.find(p => p.tokenId === battle.pet1);
  const pet2Details = pets.find(p => p.tokenId === battle.pet2);

  const handleStake = async () => {
    if (!selectedPet || !stakeAmount) {
      toast.error("Please select a pet and enter stake amount");
      return;
    }

    const amount = parseFloat(stakeAmount);
    if (amount <= 0 || amount > 1) {
      toast.error("Stake amount must be between 0 and 20 FLOW Tokens");
      return;
    }

    setStakeLoading(true); // Only affects stake button
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.stake(battle.battleId, selectedPet, {
        value: ethers.parseEther(stakeAmount)
      });
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success("Stake placed successfully!");
        setStakeAmount('');
        setSelectedPet(null);
        onBattleUpdate();
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setStakeLoading(false); // Reset only stake loading
    }
  };

  const handleResolveBattle = async () => {
    setResolveLoading(true); // Only affects resolve button
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.resolveBattle(battle.battleId);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success("Battle resolved successfully!");
        onBattleUpdate();
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setResolveLoading(false); // Reset only resolve loading
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold font-press-start-2p">Battle #{battle.battleId}</h3>
        <span className={`px-3 py-1 rounded text-sm font-bold ${
          battleEnded 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {battleEnded ? 'ENDED' : 'ACTIVE'}
          
        </span>
        {battleEnded && (
            <span className="ml-2 text-gray-600">
              Winner: {battle.winner==0 ? pet1Details?.name : pet2Details?.name}
            </span>
          )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-4 border-2 border-gray-300 rounded">
          {pet1Details && (
            <img 
              src={pet1Details.image} 
              alt={pet1Details.name} 
              className="w-20 h-20 mx-auto rounded-lg object-cover mb-2"
            />
          )}
          <h4 className="font-bold">{pet1Details?.name || `Pet #${battle.pet1}`}</h4>
          <p className="text-sm text-gray-600">ID: {battle.pet1}</p>
          <p className="text-sm text-gray-600">Level: {pet1Details?.level || 'N/A'}</p>
          <p className="text-sm text-gray-600">Stakes: {pet1Stakes} FLOW</p>
         
        </div>
        
        {/* Pet 2 - FIXED WINNER LOGIC */}
        <div className="text-center p-4 border-2 border-gray-300 rounded">
          {pet2Details && (
            <img 
              src={pet2Details.image} 
              alt={pet2Details.name} 
              className="w-20 h-20 mx-auto rounded-lg object-cover mb-2"
            />
          )}
          <h4 className="font-bold">{pet2Details?.name || `Pet #${battle.pet2}`}</h4>
          <p className="text-sm text-gray-600">ID: {battle.pet2}</p>
          <p className="text-sm text-gray-600">Level: {pet2Details?.level || 'N/A'}</p>
          <p className="text-sm text-gray-600">Stakes: {pet2Stakes} FLOW</p>
          
         
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Creator: {battle.creator.slice(0, 6)}...{battle.creator.slice(-4)}
      </p>

      {!battleEnded && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Select Pet to Stake On:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPet(battle.pet1)}
                className={`flex-1 py-2 px-4 rounded font-bold ${
                  selectedPet === battle.pet1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {pet1Details?.name || `Pet #${battle.pet1}`}
              </button>
              <button
                onClick={() => setSelectedPet(battle.pet2)}
                className={`flex-1 py-2 px-4 rounded font-bold ${
                  selectedPet === battle.pet2 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {pet2Details?.name || `Pet #${battle.pet2}`}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Stake Amount (FLOW):</label>
            <input
              type="number"
              step="0.01"
              max="1"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="w-full p-2 border-2 border-black rounded"
              placeholder="0.1"
            />
          </div>

          <button
            onClick={handleStake}
            disabled={stakeLoading || !selectedPet || !stakeAmount} // Only stakeLoading affects this
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {stakeLoading ? "Staking..." : "Place Stake"} {/* Only shows staking loading */}
          </button>
        </div>
      )}

      {isCreator && !battleEnded && (
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <button
            onClick={handleResolveBattle}
            disabled={resolveLoading} // Only resolveLoading affects this
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {battle.creator==address && resolveLoading ? "Resolving..." : "🎲 Resolve Battle (VRF)"} {/* Only shows resolve loading */}
          </button>
        </div>
      )}
    </div>
  );
}
