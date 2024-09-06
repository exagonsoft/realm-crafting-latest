"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import { AuthProvider } from "@/context/AuthContext";
import MainWrapper from "@/components/shared/MainWrapper";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={inter.className}>
        <ThirdwebProvider>
          <AuthProvider>
            <div className="main-layout">
              <MainWrapper>
                {children}
              </MainWrapper>
            </div>
          </AuthProvider>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
