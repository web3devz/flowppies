"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { flowContractAddress } from "../../utils/contractAddress";
import abi from "../../utils/abi.json";
import { useAccount } from "wagmi";
import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useWalletClient } from "wagmi";
import { ethers } from "ethers";

function PetDetailsInner() {
  const { address: currentUserAddress } = useAccount();
  const { data: walletClient } = useWalletClient();
  const searchParams = useSearchParams();
  const [hasEvolved, setHasEvolved] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [petName, setPetName] = useState(
    searchParams.get("name") || "Unnamed Pet"
  );
  const [currentBackstory, setCurrentBackstory] = useState(
    searchParams.get("backstory") || searchParams.get("description") || ""
  );
  
  const [userPrompt, setUserPrompt] = useState("");
  const [newBackstory, setNewBackstory] = useState("");
  const [isLoadingBackstory, setIsLoadingBackstory] = useState(false);
  const [showBackstoryUpdate, setShowBackstoryUpdate] = useState(false);
  const backstoryInputRef = useRef<HTMLTextAreaElement>(null);
  const petId = searchParams.get("petId");
  const name = searchParams.get("name");
  const imageSrc = searchParams.get("imageSrc");
  const metadataUrl = searchParams.get("metadataUrl");
  const owner = searchParams.get("owner");
  const description = searchParams.get("description");
  const multiplier = searchParams.get("multiplier");
  const backstory = searchParams.get("backstory");
  const happiness = searchParams.get("stats.happiness");
  const memePower = searchParams.get("stats.memePower");
  const level = searchParams.get("stats.level");
  const NftLevel = searchParams.get("NftLevel");
  const points = Number(multiplier) * (Number(happiness) + Number(memePower));

  const isCreator = currentUserAddress?.toLowerCase() === owner?.toLowerCase();

  const extractTxId = (url: string) => url.split("/").pop()!;

  const updateMetadata = async (txId: string, changes: any) => {
    const res = await fetch(`https://gateway.irys.xyz/mutable/${txId}`);
    if (!res.ok) throw new Error("Failed to fetch metadata");

    const oldMeta = await res.json();

    // Add/increment attributes
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

    // Add new attributes if not present
    const existingTraits = updatedAttrs.map((a) => a.trait_type);
    const missingAttrs = changes.attributes?.filter(
      (a: any) => !existingTraits.includes(a.trait_type)
    );
    if (missingAttrs) {
      updatedAttrs = [...updatedAttrs, ...missingAttrs];
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
      if (newMeta.description) {
        setCurrentBackstory(newMeta.description);
      }
    }

    return await evolveRes.json();
  };

  const handleEvolvePet = async () => {
    if (!walletClient) {
      toast.error("Wallet client unavailable");
      throw new Error("Wallet client unavailable");
    }
    const toastId = "evolve-status";
    toast.loading("Evolving pet...", { id: toastId });
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      flowContractAddress,
      abi,
      signer
    );
    const tx = await contract.levelUp(petId)
    const receipt= await tx.wait();
    if(receipt.status == 1 && !hasEvolved) {
     try {
            const wantsToUpdateBackstory = window.confirm(
              "Do you want to update the backstory?"
            );
            const txId = extractTxId(metadataUrl!);

            let finalBackstory = currentBackstory;

            if (wantsToUpdateBackstory) {
              const prompt = window.prompt(
                "How should the backstory evolve?",
                "E.g., Bloop found a mysterious portal to Meme Mountain..."
              );

              if (prompt) {
                const response = await fetch("/api/generate-backstory", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    originalBackstory: currentBackstory,
                    prompt: prompt,
                  }),
                });

                if (response.ok) {
                  const data = await response.json();
                  finalBackstory = data.modifiedBackstory;
                  
                } else {
                  throw new Error("Backstory generation failed");
                }
              }
            }

            // Update metadata with new level and final backstory
            await updateMetadata(txId, {
              description: finalBackstory,
              attributes: [{ trait_type: "Level", value: 1 }], // increment by 1
            });

            setCurrentBackstory(finalBackstory);
            setHasEvolved(true);
            toast.success("Pet evolved successfully!", { id: toastId });
          } catch (err) {
            console.error("Evolution error:", err);
            toast.error("Failed to evolve pet", { id: toastId });
            setHasEvolved(false);
          }
    }
    else{
      toast.error("Error in contract interaction", { id: "contract-interaction" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white/90 shadow-2xl rounded-2xl p-8">
        <h1 className="text-2xl font-press-start-2p mb-8 text-gray-700 text-center tracking-tight">
          {name}
        </h1>
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center space-y-10">
            {imageSrc && (
              <div className="bg-gray-100 rounded-xl border border-gray-200 shadow-lg p-4 flex items-center justify-center w-80 h-80 transform transition duration-300 hover:scale-105 hover:brightness-105">
                <Image
                  src={imageSrc}
                  alt={name || "Pet"}
                  width={320}
                  height={320}
                  className="rounded-lg object-cover w-full h-full"
                  style={{ maxHeight: 320, maxWidth: 320 }}
                />
              </div>
            )}

            <div>
              <p className="text-lg font-semibold text-gray-800">Lore:</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded break-words font-courier-prime">
                {description || backstory || "This pet has no lore yet..."}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-4">
            <div>
              <p className="text-lg font-semibold text-gray-800">Pet ID:</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded break-all font-mono">
                {petId}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">Level</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded">
                {NftLevel}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">
                Happiness ❤️
              </p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded">
                {happiness}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">Power ⚡</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded">
                {memePower}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">Multiplier:</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded break-all">
                {multiplier}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">Points 🔥</p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded break-all">
                {points}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">
                Creator Address:
              </p>
              <p className="text-md bg-gray-100 text-gray-700 p-2 rounded break-all">
                {owner}
              </p>
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-800">
                Metadata URL:
              </p>
              <Link
                href={metadataUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-blue-600 hover:underline break-all"
              >
                {metadataUrl}
              </Link>
            </div>

            <div className="mt-6">
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                onClick={handleEvolvePet}
                disabled={!isCreator || points < (Number(level) || 1) * 20}
              >
                Evolve Pet
              </button>
              {!isCreator && (
                <p className="text-sm text-red-500 mt-2">
                  Only the creator can evolve this pet.
                </p>
              )}
              {isCreator && points < (Number(level) || 1) * 20 && (
                <p className="text-sm text-yellow-600 mt-2">
                  Insufficient points to evolve{" "}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PetDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading pet details...</p>
        </div>
      </div>
    }>
      <PetDetailsInner />
    </Suspense>
  );
}
