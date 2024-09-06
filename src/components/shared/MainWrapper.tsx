'use client'
import { useAuth } from "@/context/AuthContext";
import React, { ReactNode } from "react";
import NavBar from "../NavBar";
import Footer from "../Footer";

const MainWrapper = ({ children }: { children: ReactNode }) => {
  const { isLoginPage } = useAuth();
  return (
    <main className="w-full min-h-screen gap-12 flex flex-col justify-start items-center pt-28 pb-4">
      {!isLoginPage && <NavBar className="top-2 w-full min-w-full"/>}
      {children}
      {!isLoginPage && <Footer />}
    </main>
  );
};

export default MainWrapper;