import { NextApiResponse } from "next";
import { Engine } from "@thirdweb-dev/engine";
import { LORD_CONTRACT_ADDRESS } from "@/constants/contracts";
import { getEnvironment } from "@/config/configs";
import { NextResponse } from "next/server";

export const POST = async (req: Request, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  const THIRDWEB_ENGINE_URL = getEnvironment().THIRDWEB_ENGINE_URL;
  const THIRDWEB_ENGINE_ACCESSTOKEN =
    getEnvironment().THIRDWEB_ENGINE_ACCESSTOKEN;
  const THIRDWEB_ENGINE_WALLET = getEnvironment().THIRDWEB_ENGINE_WALLET;

  try {
    if (
      !THIRDWEB_ENGINE_URL ||
      !THIRDWEB_ENGINE_ACCESSTOKEN ||
      !THIRDWEB_ENGINE_WALLET
    ) {
      throw new Error("Environment variables not set");
    }

    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 402 }
      );
    }

    const engine = new Engine({
      url: THIRDWEB_ENGINE_URL,
      accessToken: THIRDWEB_ENGINE_ACCESSTOKEN,
    });

    console.log(
      `ENGINE INITIALIZED. Checking Lord NFT for address ${walletAddress}`
    );

    const lordTokens = await engine.erc721.getOwned(
       walletAddress,
      "sepolia",
      LORD_CONTRACT_ADDRESS,
    );


    return NextResponse.json(
      { success: true, message: JSON.stringify(lordTokens.result) },
      { status: 200 }
    );
  } catch (error) {
    console.log("🚨 Error: ", error);
    return NextResponse.json(
      { message: "Error claiming Lord NFT", error: JSON.stringify(error) },
      { status: 400 }
    );
  }
};
