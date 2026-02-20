"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { flowContractAddress} from "../../utils/contractAddress";
import abi from "../../utils/abi.json";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";

export default function PetCard({
  petId,
  imageSrc,
  owner,
  metadataUrl,
  multiplier,
  NftLevel,
}: any) {
  const router = useRouter();
  const [attributes, setAttributes] = useState<any[]>([]);
  const [petName, setPetName] = useState("Unnamed Pet");
  const [description, setDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [hasFed, setHasFed] = useState(false);
  const [hasTrained, setHasTrained] = useState(false);
  const { address, isConnected } = useAccount();
  console.log(isConnected, address);
  const { data: walletClient } = useWalletClient();
  const extractTxId = (url: string) => url.split("/").pop()!;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const txId = extractTxId(metadataUrl);
        const res = await fetch(`https://gateway.irys.xyz/mutable/${txId}`);
        if (res.ok) {
          const data = await res.json();
          setAttributes(data.attributes || []);
          setPetName(data.name || "Unnamed Pet");
          setDescription(data.description || "");
          setBackstory(data.backstory || "");
        }
      } catch (err) {
        console.error("Error loading metadata:", err);
      }
    };

    fetchMetadata();
  }, [metadataUrl]);

  const updateMetadata = async (txId: string, changes: any) => {
    const res = await fetch(`https://gateway.irys.xyz/mutable/${txId}`);
    if (!res.ok) throw new Error("Failed to fetch metadata");
    const oldMeta = await res.json();

    let updatedAttrs = oldMeta.attributes.map((attr: any) => {
      const updated = changes.attributes?.find(
        (a: any) => a.trait_type === attr.trait_type
      );
      if (updated) {
        return {
          ...attr,
          value: parseFloat(
            (parseFloat(attr.value) + updated.value).toFixed(2)
          ),
        };
      }
      return attr;
    });

    // Update Points
    const happiness =
      updatedAttrs.find((a) => a.trait_type === "Happiness")?.value ?? 0;
    const power =
      updatedAttrs.find((a) => a.trait_type === "Power")?.value ?? 0;
    const multiplier =
      updatedAttrs.find((a) => a.trait_type === "Multiplier")?.value ?? 1;
    const points = parseFloat(((happiness + power) * multiplier).toFixed(2));

    const existingPoints = updatedAttrs.find((a) => a.trait_type === "Points");
    if (existingPoints) {
      existingPoints.value = points;
    } else {
      updatedAttrs.push({ trait_type: "Points", value: points });
    }

    const newMeta = {
      ...oldMeta,
      ...changes,
      attributes: updatedAttrs,
    };

    const metadataBlob = new Blob([JSON.stringify(newMeta)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json");
    const formData = new FormData();
    formData.append("file", metadataFile);
    formData.append("rootTxId", txId);

    const evolveRes = await fetch("/api/irys/evolve-file", {
      method: "POST",
      body: formData,
    });

    if (!evolveRes.ok) throw new Error("Evolve failed");

    const updatedRes = await fetch(`https://gateway.irys.xyz/mutable/${txId}`);
    if (updatedRes.ok) {
      const newMeta = await updatedRes.json();
      setAttributes(newMeta.attributes || []);
      setPetName(newMeta.name || "Unnamed Pet");
    }

    return await evolveRes.json();
  };

  const handleFeedFlow= async ()=>{
     if (!walletClient) {
          toast.error("Wallet client unavailable");
          throw new Error("Wallet client unavailable");
        }
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(flowContractAddress, abi, signer);
    const tx = await contract.feed(petId, { value: ethers.parseEther("0.01") });
    const receipt = await tx.wait();
    console.log("Transaction successful:", receipt);
    if (receipt.status === 1) {
      const toastId = "feed-status";
      toast.loading("Feeding pet...", { id: toastId });
      try {
        const txId = extractTxId(metadataUrl);
        await updateMetadata(txId, {
          attributes: [
            { trait_type: "Happiness", value: 5 },
            { trait_type: "Power", value: 1 },
            { trait_type: "Multiplier", value: 0.1 },
          ],
        });
        toast.success("Pet Fed!", { id: toastId });
      } catch {
        toast.error("Failed to feed pet.", { id: toastId });
      }
    }
  }

  const handleTrainFlow = async () => {
    if (!walletClient) {
         toast.error("Wallet client unavailable");
         throw new Error("Wallet client unavailable");
       }
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(flowContractAddress, abi, signer);
    const tx = await contract.train(petId, { value: ethers.parseEther("0.02") });
    const receipt = await tx.wait();
    console.log("Transaction successful:", receipt);
    if (receipt.status === 1) {
      const toastId = "train-status";
      toast.loading("Training pet...", { id: toastId });
      try {
        const txId = extractTxId(metadataUrl);
        await updateMetadata(txId, {
          attributes: [
            { trait_type: "Happiness", value: 1 },
            { trait_type: "Power", value: 5 },
            { trait_type: "Multiplier", value: 0.15 },
          ],
        });
        toast.success("Pet Trained!", { id: toastId });
      } catch {
        toast.error("Failed to train pet.", { id: toastId });
      }
    }
  }

  const happiness =
    attributes.find((attr) => attr.trait_type === "Happiness")?.value ?? 0;
  const power =
    attributes.find((attr) => attr.trait_type === "Power")?.value ?? 0;
  const level =
    attributes.find((attr) => attr.trait_type === "Level")?.value ?? 1;

  const handleExplore = () => {
    const toastId= 'explore-status'
    toast.loading("Exploring pet details...", { id: toastId });
    const queryParams = new URLSearchParams({
      petId,
      owner,
      imageSrc,
      metadataUrl,
      name: petName,
      description: description,
      backstory: backstory,
      multiplier: multiplier,
      NftLevel: NftLevel,
      "stats.happiness": happiness.toString(),
      "stats.memePower": power.toString(),
      "stats.level": level.toString(),
    });

    router.push(`/pet-details?${queryParams.toString()}`);
    toast.success("Exploring pet details...", { id: toastId });
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 transform transition duration-300 ease-in-out hover:scale-[1.1] hover:shadow-xl">
      <div className="relative w-full h-72 bg-gray-100">
        <img
          src={imageSrc}
          alt="NFT"
          className="w-full h-full object-cover rounded-xl"
          onError={(e) =>
            (e.currentTarget.src = "https://via.placeholder.com/150")
          }
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button onClick={handleFeedFlow}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-sm text-sm font-semibold font-courier-prime">
          Feed</button>
         <button onClick={handleTrainFlow}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-sm text-sm font-semibold font-courier-prime">
          Train</button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-base font-press-start text-gray-800 mb-1">
          {petName}
        </h2>
        <h2 className="text-base font-press-start text-gray-800 mb-1">
          Multiplier: {multiplier}
        </h2>
        <h2 className="text-base font-press-start text-gray-800 mb-1">
          Level: {NftLevel}
        </h2>
        <div className="text-sm font-courier-prime text-gray-500 mb-1">
          Owner: {owner.slice(0, 6)}...{owner.slice(-4)}
        </div>
        <div className="flex justify-between text-md mb-3">
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">❤️</span> {happiness}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-lg">⚡</span> {power}
          </div>
        </div>
        <button
          onClick={handleExplore}
          className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white py-2 px-4 rounded-md text-base flex justify-center items-center gap-2"
        >
          <Search className="w-5 h-5" /> Explore
        </button>
      </div>
    </div>
  );
}
