"use client";
import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import PetCard from "../components/Pet";
import abi from "../../utils/abi.json";
import { ethers } from "ethers";
import {flowContractAddress } from "../../utils/contractAddress";
import { useWalletClient } from "wagmi";
import {useAccount} from "wagmi";
import { getNFT } from "../helper/getNFT";

export default function HomepagePreview() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  console.log(isConnected, address);
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    // const fetchNFTs = async () => {
    //   try {
    //     setLoading(true);
    //     // const provider = new JsonRpcProvider(
    //     //   process.env.NEXT_PUBLIC_ALCHEMY_FLOW_API_KEY
    //     // );
    //     if(!walletClient) throw new Error('Wallet client unavailable');
    //     const provider = new ethers.BrowserProvider(walletClient.transport);    
    //     const contract = new Contract(flowContractAddress, abi, provider);
    //     console.log(contract)
    //     const totalSupply = await contract.totalSupply();
    //     console.log("Total Supply:", totalSupply.toString());
    //     const nftList = [];

    //     for (let i = 0; i < Number(totalSupply); i++) {
    //       const tokenId = await contract.tokenByIndex(i);
    //       const owner = await contract.ownerOf(tokenId);
    //       const tokenURI = await contract.tokenURI(tokenId);
    //       const multiplier = await contract.tokenIdToMultiplier(tokenId);
    //       const formatedMultiplier = (parseFloat(multiplier) / 1e18).toFixed(2);
    //       const level = await contract.tokenIdToLevel(tokenId);
    //       const formatedLevel = (parseFloat(level) / 1e18).toFixed(0);

    //       // If IPFS, convert to gateway URL
    //       let metadataUrl = tokenURI;
    //       if (tokenURI.startsWith("ipfs://")) {
    //         metadataUrl = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    //       }

    //       // Fetch metadata
    //       let image = "";
    //       try {
    //         const res = await fetch(metadataUrl);
    //         const metadata = await res.json();
    //         image = metadata.image || metadata.image_url || "";
    //         if (image.startsWith("ipfs://")) {
    //           image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
    //         }
    //       } catch {
    //         image = "";
    //       }

    //       nftList.push({
    //         tokenId: tokenId.toString(),
    //         owner,
    //         image,
    //         metadataUrl,
    //         formatedMultiplier,
    //         formatedLevel,
    //       });
    //     }
    //     setNfts(nftList);
    //     setLoading(false);
    //   } catch (err) {
    //     console.error("Error fetching NFTs:", err);
    //   }
      
    // };

    // fetchNFTs();
    // const res= getNFT()
    // console.log(res)
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        const rawResults = await getNFT()
        // Parse and normalize each NFT
        const parsedNFTs = await Promise.all(
          rawResults.map(async (item) => {
            // Attempt to parse metadata JSON from Moralis
            let metadata = {};
            if (item.metadata) {
              try {
                metadata = JSON.parse(item.metadata);
              } catch {
                metadata = {};
              }
            } else if (item.token_uri) {
              // Fallback: fetch metadata from token_uri
              try {
                const res = await fetch(item.token_uri);
                metadata = await res.json();
              } catch {
                metadata = {};
              }
            }

            // Normalize image URL
            let imageUrl = metadata.image || metadata.image_url || "";
            if (imageUrl.startsWith("ipfs://")) {
              imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
            }

            return {
              tokenId: item.token_id,
              owner: item.owner_of,
              image: imageUrl,
              metadataUrl: item.token_uri,
              name: metadata.name || item.name,
              attributes: metadata.attributes || []
            };
          })
        );

        setNfts(parsedNFTs);
      } catch (error) {
        console.error("Error fetching NFTs via Moralis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);



  return (
    <div className="relative min-h-screen w-full">
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/igb.png)" }}
      />
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="w-4/5 min-h-screen overflow-y-auto bg-white bg-opacity-90 rounded-lg shadow-lg p-8 flex items-center justify-center flex-col space-y-1">
          {/* <Wallet/> */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-7 font-press-start-2p text-center">
              Minted NFTs
            </h2>
            {/* <button onClick={fetchNFTs}>fetch nfts</button> */}
            {loading ? (
              <div className="text-gray-500">Loading...Make sure your wallet is connected</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                {nfts.map((nft) => (
                  <PetCard
                    key={nft.tokenId}
                    petId={nft.tokenId}
                    imageSrc={nft.image}
                    owner={nft.owner}
                    metadataUrl={nft.metadataUrl}
                    multiplier={nft.formatedMultiplier}
                    NftLevel={nft.formatedLevel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
