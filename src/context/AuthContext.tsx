// src/context/auth-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, FC, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn } from "@/app/actions/auth";

interface AuthContextType {
  isLogged: boolean;
  navigate: (route: string) => void;
  checkAuth: () => Promise<boolean>;
  isLoginPage: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const navigate = (route: string) => {
    router.push(route);
  };

  const checkAuth = async (): Promise<boolean> => {
    const _is_logged = await isLoggedIn();
    setIsLogged(_is_logged);
    return _is_logged;
  };

  return (
    <AuthContext.Provider value={{ isLogged, navigate, checkAuth, isLoginPage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
