import { NextRequest, NextResponse } from "next/server";
import { Uploader } from "@irys/upload";
import { BaseEth } from "@irys/upload-ethereum";

export async function POST(req: NextRequest) {
  try {
    const rpcURL = 'https://base-sepolia-rpc.publicnode.com';
    const irysUploader = await Uploader(BaseEth).withWallet(process.env.PRIVATE_KEY!);
    const fundTx = await irysUploader.fund(irysUploader.utils.toAtomic(0.0008));
    return NextResponse.json({
      message: `Successfully funded ${irysUploader.utils.fromAtomic(fundTx.quantity)} ${irysUploader.token}`,
    });
  } catch (e: any) {
    console.error("Fund error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}