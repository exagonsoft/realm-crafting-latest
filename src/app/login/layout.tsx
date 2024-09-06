"use client";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThirdwebProvider>
      <AuthProvider>
        <div className="w-full h-screen flex justify-center items-center">{children}</div>
      </AuthProvider>
    </ThirdwebProvider>
  );
}
