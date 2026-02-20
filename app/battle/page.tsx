"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { toast } from 'react-hot-toast';
import CreateBattle from '../components/CreateBattle';
import { flowContractAddress } from '@/utils/contractAddress';
import BattleCard from '../components/BattleCard';
import { Battle, Pet } from '../types/battle';
import abi from '../../utils/abi.json'

export default function BattlesPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPets = async () => {
    if (!walletClient) return;

    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const contract = new ethers.Contract(flowContractAddress, abi, provider);
      
      const totalSupply = await contract.totalSupply();
      const petList: Pet[] = [];

      for (let i = 0; i < Number(totalSupply); i++) {
        const tokenId = await contract.tokenByIndex(i);
        const owner = await contract.ownerOf(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        const multiplier = await contract.tokenIdToMultiplier(tokenId);
        const level = await contract.tokenIdToLevel(tokenId);

        let metadataUrl = tokenURI;
        if (tokenURI.startsWith("ipfs://")) {
          metadataUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
        }

        let image = "";
        let name = `Pet #${tokenId}`;
        try {
          const res = await fetch(metadataUrl);
          const metadata = await res.json();
          image = metadata.image || "";
          name = metadata.name || `Pet #${tokenId}`;
          if (image.startsWith("ipfs://")) {
            image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
          }
        } catch {
          image = "";
        }

        petList.push({
          tokenId: Number(tokenId),
          owner,
          image,
          name,
          multiplier: (parseFloat(multiplier) / 1e18).toFixed(2),
          level: (parseFloat(level) / 1e18).toFixed(0)
        });
      }
      setPets(petList);
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const fetchBattles = async () => {
    if (!walletClient) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(walletClient.transport);
      const contract = new ethers.Contract(flowContractAddress, abi, provider);
      
      const battleCount = await contract.battleCount();
      const battlesData: Battle[] = [];
      
      for (let i = 0; i < battleCount; i++) {
        try {
          const battleDetails = await contract.getBattleDetails(i);
          battlesData.push({
            battleId: i,
            pet1: Number(battleDetails.pet1),
            pet2: Number(battleDetails.pet2),
            creator: battleDetails.creator,
            active: battleDetails.active,
            totalStakePet1: battleDetails.totalStakePet1.toString(),
            totalStakePet2: battleDetails.totalStakePet2.toString(),
            winner: Number(battleDetails.winner)
          });
        } catch (error) {
          console.error(`Error fetching battle ${i}:`, error);
        }
      }
      
      setBattles(battlesData.reverse());
    } catch (error) {
      toast.error("Error fetching battles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletClient) {
      fetchPets();
      fetchBattles();
    }
  }, [walletClient]);

  if (!address) {
    return (
      <div className="relative min-h-screen w-full">
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/bg-gen.png)' }}
        />
        <div className="relative min-h-screen w-full flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-4xl font-bold mb-4 font-press-start-2p">Pet Battles</h1>
            <p>Please connect your wallet to view battles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/bg-gen.png)' }}
      />
      <img 
        src="/totoro_bg.png" 
        alt="Totoro"
        className="absolute bottom-0 right-0 z-40 w-[250px] h-auto max-w-full md:max-w-[30%] sm:max-w-[40%]"
      />
      
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-4/5 min-h-screen overflow-y-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-8">
          
          <h1 className="text-4xl font-bold mb-8 text-center font-press-start-2p">Pet Battles Arena</h1>
          
          {/* Changed to flex-col layout */}
          <div className="flex flex-col space-y-8">
            
            {/* Create Battle Section */}
            <div className="w-full">
              <CreateBattle
                walletClient={walletClient}
                contractAddress={flowContractAddress}
                abi={abi}
                pets={pets}
                onBattleCreated={fetchBattles}
              />
            </div>
            
            {/* Battles Section */}
            <div className="w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-press-start-2p">Active Battles</h2>
                <button
                  onClick={fetchBattles}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Refresh"}
                </button>
              </div>
              
              <div className="space-y-6">
                {battles.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No battles found. Create the first one!</p>
                  </div>
                ) : (
                  battles.map((battle) => (
                    <BattleCard
                      key={battle.battleId}
                      battle={battle}
                      pets={pets}
                      walletClient={walletClient}
                      contractAddress={flowContractAddress}
                      abi={abi}
                      onBattleUpdate={fetchBattles}
                    />
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
