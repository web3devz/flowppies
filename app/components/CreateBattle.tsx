"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { Pet } from '../types/battle';

interface CreateBattleProps {
  walletClient: any;
  contractAddress: string;
  abi: any;
  pets: Pet[];
  onBattleCreated: () => void;
}

export default function CreateBattle({ walletClient, contractAddress, abi, pets, onBattleCreated }: CreateBattleProps) {
  const { address } = useAccount();
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateBattle = async () => {
    if (!selectedPet1 || !selectedPet2) {
      toast.error("Please select both pets");
      return;
    }

    if (selectedPet1.tokenId === selectedPet2.tokenId) {
      toast.error("Cannot battle the same pet");
      return;
    }

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.createBattle(selectedPet1.tokenId, selectedPet2.tokenId);
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success("Battle created successfully!");
        setSelectedPet1(null);
        setSelectedPet2(null);
        onBattleCreated();
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-4 border-black">
      <h2 className="text-2xl font-bold mb-4 font-press-start-2p text-center">Create Battle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pet 1 Selection */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-blue-600">Select Pet 1</h3>
          <div className="border-2 border-blue-300 rounded-lg p-4 max-h-96 overflow-y-auto">
            {selectedPet1 && (
              <div className="mb-4 p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={selectedPet1.image} alt={selectedPet1.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">{selectedPet1.name}</p>
                    <p className="text-sm">ID: {selectedPet1.tokenId}</p>
                    <p className="text-sm">Level: {selectedPet1.level}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {pets.map((pet) => (
                <div
                  key={pet.tokenId}
                  onClick={() => setSelectedPet1(pet)}
                  className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                    selectedPet1?.tokenId === pet.tokenId 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img src={pet.image} alt={pet.name} className="w-full h-20 object-cover rounded" />
                  <p className="text-xs font-bold mt-1">ID: {pet.tokenId}</p>
                  <p className="text-xs">Lvl: {pet.level}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pet 2 Selection */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-red-600">Select Pet 2</h3>
          <div className="border-2 border-red-300 rounded-lg p-4 max-h-96 overflow-y-auto">
            {selectedPet2 && (
              <div className="mb-4 p-3 bg-red-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={selectedPet2.image} alt={selectedPet2.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-bold">{selectedPet2.name}</p>
                    <p className="text-sm">ID: {selectedPet2.tokenId}</p>
                    <p className="text-sm">Level: {selectedPet2.level}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {pets.map((pet) => (
                <div
                  key={pet.tokenId}
                  onClick={() => setSelectedPet2(pet)}
                  className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${
                    selectedPet2?.tokenId === pet.tokenId 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <img src={pet.image} alt={pet.name} className="w-full h-20 object-cover rounded" />
                  <p className="text-xs font-bold mt-1">ID: {pet.tokenId}</p>
                  <p className="text-xs">Lvl: {pet.level}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCreateBattle}
        disabled={loading || !selectedPet1 || !selectedPet2}
        className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Battle"}
      </button>
    </div>
  );
}
