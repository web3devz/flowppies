"use client";
import { Button } from "./ui/button";
import { Download, RotateCcw, MessageCircle, Link } from "lucide-react";
import { useState } from "react";
import { HistoryItem, HistoryPart } from "@/lib/types";
import { useAccount } from "wagmi";
import abi from "../../utils/abi.json";
import { flowContractAddress } from "../../utils/contractAddress";
import { useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import toast from "react-hot-toast";
interface ImageResultDisplayProps {
  imageUrl: string;
  backstory: string | null;
  petName: string | null;
  onReset: () => void;
  conversationHistory?: HistoryItem[];
}

export function ImageResultDisplay({
  imageUrl,
  backstory,
  petName,
  onReset,
  conversationHistory = [],
}: ImageResultDisplayProps) {
    const { data: walletClient } = useWalletClient();

  const { address, isConnected } = useAccount();
  console.log(isConnected, address);
  const [showHistory, setShowHistory] = useState(false);
  const [isMinted, setIsMinted] = useState(false);
  const [hash,setHash] = useState("");
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

 
  const handleMintNFT = async () => {
  let toastId: string = "";

  try {
    if (!imageUrl.startsWith("data:image")) {
      toast.error("Invalid image data URL");
      return;
    }
    if (!walletClient) {
         toast.error("Wallet client unavailable");
         throw new Error("Wallet client unavailable");
       }
    toastId = toast.loading("Uploading image to Irys...");

    // Convert base64 image to File
    const base64Data = imageUrl.split(",")[1];
    const binary = atob(base64Data);
    const array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const file = new File([array], "pet-image.png", { type: "image/png" });

    // Step 1: Upload image to Irys
    const formData1 = new FormData();
    formData1.append("file", file);
    formData1.append(
      "tags",
      JSON.stringify([{ name: "application-id", value: "MyNFTDrop" }])
    );

    const imgRes = await fetch("/api/irys/upload-file", {
      method: "POST",
      body: formData1,
    });

    if (!imgRes.ok) {
      const err = await imgRes.json();
      throw new Error("Image upload failed: " + err.error);
    }

    const imgResData = await imgRes.json();
    const imgTxId = imgResData.id;
    const imageIrysUrl = `https://gateway.irys.xyz/mutable/${imgTxId}`;

    toast.success("Image uploaded!", { id: toastId });
    toastId = toast.loading("Uploading metadata...");

    // Step 2: Create NFT metadata
    const metadata = {
      name: petName ?? "Unnamed Pet",
      description: backstory ?? "An enigmatic creature.",
      image: imageIrysUrl,
      creator: address,
      attributes: [
        { trait_type: "Level", value: 1 },
        { trait_type: "Happiness", value: 5 },
        { trait_type: "Power", value: 5 },
        { trait_type: "Multiplier", value: 1 },
        { trait_type: "Points", value: 0 },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json");

    // Step 3: Upload metadata to Irys
    const formData2 = new FormData();
    formData2.append("file", metadataFile);
    formData2.append(
      "tags",
      JSON.stringify([{ name: "Root-TX", value: imgTxId }])
    );

    const metaRes = await fetch("/api/irys/upload-file", {
      method: "POST",
      body: formData2,
    });

    if (!metaRes.ok) {
      const err = await metaRes.json();
      throw new Error("Metadata upload failed: " + err.error);
    }

    const metaResData = await metaRes.json();
    const NFTTxId = metaResData.id;
    const NFTIrysUrl = `https://gateway.irys.xyz/mutable/${NFTTxId}`;

    toast.success("Metadata uploaded!", { id: toastId });
    toastId = toast.loading("Minting NFT onchain...");

    // Step 4: Interact with contract
    const provider = new ethers.BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();
    const dynamicNFTContract = new ethers.Contract(flowContractAddress, abi, signer);
    const tx = await dynamicNFTContract.safeMint(NFTIrysUrl);
    const receipt = await tx.wait();

    toast.success("NFT minted successfully!", { id: toastId });
    console.log("Transaction successful:", receipt);
    setHash(receipt.transactionHash);
    setIsMinted(true);
  } catch (err: any) {
    console.error(err);
    toast.error(`Error: ${err.message ?? "Something went wrong"}`, {
      id: toastId,
    });
  }
};
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between space-x-0 md:space-x-10">
        <div className="rounded-lg bg-muted p-1">
          <img
            src={imageUrl}
            alt="Generated"
            className="max-w-[320px] h-auto w-[300px]"
          />
        </div>

        <div className="flex flex-col">
          <div className="p-1 rounded-lg bg-muted">
            <h1 className="text-2xl text-black font-pixelify">
              {petName}
            </h1>
          </div>

          <div className="p-1 rounded-lg bg-muted">
            <h3 className="text-xl font-medium mb-2 font-pixelify text-black">Lore-</h3>
            <p className="text-md text-black font-courier-prime">
              {backstory}
            </p>
          </div>
        </div>

       <div className="flex items-center justify-between">
  <div className="space-x-2 flex flex-col space-y-2">
    {/* Download */}
    <Button
      className="bg-[#C9C9AA] text-black font-pixelify hover:bg-[#C9C9AA]/80 transition-colors duration-200"
      onClick={handleDownload}
    >
      <Download className="w-4 h-4 mr-2" />
      Download
    </Button>

    {/* Show History */}
    {conversationHistory.length > 0 && (
      <Button
        className="bg-[#C9C9AA] text-black font-pixelify hover:bg-[#C9C9AA]/80 transition-colors duration-200"
        onClick={toggleHistory}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {showHistory ? "Hide History" : "Show History"}
      </Button>
    )}

    {/* Reset */}
    <Button
      className="bg-[#C9C9AA] text-black font-pixelify hover:bg-[#C9C9AA]/80 transition-colors duration-200"
      onClick={onReset}
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Create New Image
    </Button>

    {/* Mint NFT */}
    <Button
      onClick={handleMintNFT}
      disabled={!isConnected || isMinted}
      className="bg-[#2D80C0] text-black font-pixelify hover:bg-[#2D80C0]/80 transition-colors duration-200 disabled:opacity-50"
    >
      Mint NFT
    </Button>

    {/* Showcase link */}
    {isMinted && <Link to="/showcase" className="text-sm underline text-blue-700">See in Showcase</Link>}
  </div>
</div>

      </div>

      {showHistory && conversationHistory.length > 0 && (
        <div className="p-4 rounded-lg font-courier-prime">
          <h3 className="text-sm font-medium mb-2">Conversation History</h3>
          <div className="space-y-4">
            {conversationHistory.map((item, index) => (
              <div key={index} className={`p-3 rounded-lg bg-secondary`}>
                <p
                  className={`text-sm font-medium mb-1 ${
                    item.role === "user" ? "text-black" : "text-primary"
                  }`}
                >
                  {item.role === "user" ? "You" : "Gemini"}
                </p>
                <div className="space-y-1">
                  {item.parts.map((part: HistoryPart, partIndex) => (
                    <div key={partIndex}>
                      {part.text && <p className="text-sm">{part.text}</p>}
                      {part.image && (
                        <div className="mt-2 overflow-hidden rounded-md">
                          <img
                            src={part.image}
                            alt={`${item.role} image`}
                            className="object-contain w-[300px] h-auto"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
