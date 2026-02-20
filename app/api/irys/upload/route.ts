// app/api/irys/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

export async function POST(req: NextRequest) {
  try {
    const irysUploader = await Uploader(BaseEth).withWallet(process.env.PRIVATE_KEY!);
    const { dataToUpload } = await req.json();
    
    const receipt = await irysUploader.upload(dataToUpload);
    return NextResponse.json({
      url: `https://gateway.irys.xyz/${receipt.id}`,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


