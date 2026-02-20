import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";
import { writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Tags include 'Variant: T' to allow mutation
    const tags = [
      { name: "application-id", value: "MyNFTDrop" },
      { name: "Variant", value: "T" },
    ];

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = join(tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const rpcURL = "https://base-sepolia-rpc.publicnode.com";
    const irysUploader = await Uploader(BaseEth)
      .withWallet(process.env.PRIVATE_KEY!)
      .withRpc(rpcURL)
      .devnet();

    const receipt = await irysUploader.uploadFile(tempFilePath, { tags });

    return NextResponse.json({
      url: `https://gateway.irys.xyz/mutable/${receipt.id}`,
      id: receipt.id,
      size: receipt.size,
    });
  } catch (e: any) {
    console.error("File upload error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}