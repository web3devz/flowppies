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
    const rootTxId = formData.get("rootTxId") as string;

    if (!file || !rootTxId) {
      return NextResponse.json({ error: "Missing file or rootTxId" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = join(tmpdir(), `${uuidv4()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const rpcURL = 'https://base-sepolia-rpc.publicnode.com';
    const irysUploader = await Uploader(BaseEth)
      .withWallet(process.env.PRIVATE_KEY!)
      .withRpc(rpcURL)
      .devnet();

    const tags = [
      { name: "Root-TX", value: rootTxId }
    ];
    const receipt = await irysUploader.uploadFile(tempFilePath, { tags });

    return NextResponse.json({
      message: "Evolved successfully",
      url: `https://gateway.irys.xyz/mutable/${rootTxId}`,
      evolvedTxId: receipt.id
    });
  } catch (e: any) {
    console.error("Evolve error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
