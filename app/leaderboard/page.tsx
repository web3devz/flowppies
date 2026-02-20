"use client";

import React, { useEffect, useState } from "react";
import {  Contract } from "ethers";
import abi from "../../utils/abi.json";
import { ethers } from "ethers";
import {useAccount, useWalletClient } from "wagmi";
import { flowContractAddress} from "../../utils/contractAddress";

export default function TrendingPage() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  console.log(isConnected, address);
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // if(!walletClient) throw new Error('Wallet client unavailable');
        // const provider = new ethers.BrowserProvider(walletClient.transport);
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org')
        const contract = new Contract(flowContractAddress, abi, provider);
        const totalSupply = await contract.totalSupply();
        const nftData = [];
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = await contract.tokenByIndex(i);
          const tokenURI = await contract.tokenURI(tokenId);
          const multiplier = await contract.tokenIdToMultiplier(tokenId);
          const formatedMultiplier = (parseFloat(multiplier) / 1e18).toFixed(2);

          let metadataUrl = tokenURI;
          if (tokenURI.startsWith("ipfs://")) {
            metadataUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          }

          try {
            const res = await fetch(metadataUrl);
            const metadata = await res.json();

            const creator = metadata.creator || "Unknown";
            const name = metadata.name || `NFT #${tokenId}`;
            const image = metadata.image?.startsWith("ipfs://")
              ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
              : metadata.image || "";

            const powerAttribute = metadata.attributes?.find(
              (attr) => attr.trait_type === "Power"
            );
            const power = powerAttribute ? powerAttribute.value : 0;
            const HappinessAttribute = metadata.attributes?.find(
              (attr) => attr.trait_type === "Happiness"
            );
            const happiness = HappinessAttribute ? HappinessAttribute.value : 0;

            const points = (happiness + power) * formatedMultiplier;

            nftData.push({
              tokenId: tokenId.toString(),
              name,
              creator,
              image,
              power,
              happiness,
              points,
            });
          } catch (err) {
            console.error("Failed to fetch metadata for token", tokenId, err);
          }
        }

        // Sort NFTs by descending power
        nftData.sort((a, b) => b.points - a.points);

        setNfts(nftData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/igb.png)" }}
      />

      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-4/5 min-h-screen overflow-y-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-6 flex flex-col space-y-4">
          <h1 className="font-press-start-2p text-xl md:text-2xl font-extrabold text-center text-gray-800 mb-6">
            🔥 Leaderboard 🔥
          </h1>

          {loading ? (
            <p className="text-center text-gray-600">Loading NFTs...</p>
          ) : nfts.length === 0 ? (
            <p className="text-center text-gray-600">Loading NFTs....</p>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto text-center border-collapse text-black">
                <thead className="bg-green-600">
                  <tr className="text-white">
                    <th className="p-3">Rank</th>
                    <th className="p-3">Image</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Creator</th>
                    <th className="p-3">🔥Points</th>
                  </tr>
                </thead>
                <tbody>
                  {nfts.map((nft, index) => (
                    <tr key={nft.tokenId} className="border-b">
                      <td className="p-3 font-bold">#{index + 1}</td>
                      <td className="p-3">
                        <img
                          src={nft.image}
                          alt={nft.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-3">{nft.name}</td>
                      <td className="p-3 break-words">{nft.creator}</td>
                      <td className="p-3 font-semibold text-red-600">
                        {nft.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
           <div className="w-4/5 mx-auto mt-6 mb-8 p-4 bg-blue-100 border-l-4 border-blue-400 rounded text-blue-900 text-center text-lg font-semibold shadow">
        <span>View the collectibles on </span>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-500 mx-1"
        >
          OpenSea
        </a>
        <span>and</span>
        <a
          href=""
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline hover:text-blue-500 mx-1"
        >
          Flow Explorer
        </a>
        <span>!</span>
      </div>
        </div>
        
      </div>
     
     
    </div>
  );
}
