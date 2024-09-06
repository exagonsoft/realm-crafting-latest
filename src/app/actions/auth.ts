"use server";
import { createAuth, VerifyLoginPayloadParams } from "thirdweb/auth";
import { privateKeyToAccount } from "thirdweb/wallets";
import { cookies } from "next/headers";
import { client } from "@/lib/client";

const privateKey =
  process.env.PRIVATE_KEY ||
  "0x5b0b4c9fd1ffc668ca18c153df80aee4ba7c510c245c9107ae16dbf35fd039f6";

if (!privateKey) {
  throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.");
}

const thirdwebAuth = createAuth({
  client,
  domain: process.env.DOMAIN || "http://localhost:3000",
  adminAccount: privateKeyToAccount({ client, privateKey }),
});

export const generatePayload = thirdwebAuth.generatePayload;

export async function login(payload: VerifyLoginPayloadParams): Promise<boolean> {
  const verifiedPayload = await thirdwebAuth.verifyPayload(payload);
  
  if (verifiedPayload.valid) {
    const jwt = await thirdwebAuth.generateJWT({
      payload: verifiedPayload.payload,
    });
    cookies().set("jwt", jwt);
    return true;
  }else{
    return false;
  }
}

export async function isLoggedIn() {
  const jwt = cookies().get("jwt");
  if (!jwt?.value) {
    return false;
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: jwt.value });
  if (!authResult.valid) {
    return false
  }
  return true;
}

export async function logout() {
  cookies().delete("jwt");
}


