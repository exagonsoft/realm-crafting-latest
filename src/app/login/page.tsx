"use client";
import { client } from "@/lib/client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { sepolia } from "thirdweb/chains";
import {
  ConnectButton,
  ConnectEmbed,
  TransactionButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { Account, inAppWallet, privateKeyToAccount } from "thirdweb/wallets";
import { login, logout } from "../actions/auth";
import LoadingAnimation from "@/components/shared/LoadingAnimator";
import { useAuth } from "@/context/AuthContext";
import { defineChain, getContract, readContract } from "thirdweb";
import {
  LORD_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
} from "@/constants/contracts";
import {
  claimTo as claimLordNft,
  balanceOf as lordBalance,
} from "thirdweb/extensions/erc721";
import { balanceOf as tokenBalance } from "thirdweb/extensions/erc20";
import {
  createAuth,
  signLoginPayload,
  VerifyLoginPayloadParams,
} from "thirdweb/auth";
import { getEnvironment } from "@/config/configs";

const LoginPage = () => {
  const [loadingLordStatus, setLoadingLordStatus] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showClaimSection, setShowClaimSection] = useState(false);
  const account = useActiveAccount();
  const { navigate } = useAuth();
  const lordContract = getContract({
    client,
    chain: defineChain(sepolia),
    address: LORD_CONTRACT_ADDRESS,
  });

  const checkNewPlayer = async (account: Account) => {
    const address = account.address;
    try {
      if (address) {
        setLoadingLordStatus(true);
        setLoadingMessage("Checking lord balance...");

        const lordBalance = await readContract({
          contract: lordContract,
          method: "function balanceOf(address owner) view returns (uint256)",
          params: [address!],
        });

        if (lordBalance.toString() === "0") {
          try {
            setLoadingLordStatus(false);
            setLoadingMessage("");
            setShowClaimSection(true);
          } catch (error) {
            console.log(error);
          }
        } else {
          setLoadingMessage("Try to Login...");
          const signedMessage = await getVerifiedPayload(account);
          const isLogged = await login(signedMessage!);
          if (isLogged) navigate("/");
        }
      } else {
        alert("Wallet not connected !!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loadingLordStatus) {
    return (
      <div className="loading_titled_container">
        <h1 className="">{loadingMessage}</h1>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="w-full m-w-[1440px] px-4 my-0 mx-auto flex flex-col justify-center items-center min-h-[90vh]">
      <div className="flex flex-col gap-2 items-center">
        <Image
          width={80}
          height={80}
          src="/images/logo.png"
          alt="Logo"
          className="rounded-full"
        />
        <h1 className="">Crafting Kingdoms</h1>
      </div>
      {showClaimSection ? (
        <ClaimSection
          account={account}
          setLoading={function (status: boolean, title: string): void {
            setLoadingMessage(title);
            setLoadingLordStatus(status);
          }}
          navigate={function (target: string): void {
            navigate(target);
          }}
        />
      ) : (
        <ConnectEmbed
          client={client}
          modalSize="compact"
          autoConnect={{ timeout: 12 * 60 * 60 * 1000 }}
          accountAbstraction={{
            chain: defineChain(sepolia),
            factoryAddress: getEnvironment().FACTORY_ADDRESS,
            gasless: true,
          }}
          wallets={[inAppWallet()]}
          onConnect={(wallet) => checkNewPlayer(wallet.getAccount()!)}
        />
      )}
    </div>
  );
};

export default LoginPage;

type WalletAddressProps = {
  account?: Account;
  setLoading: (status: boolean, title: string) => void;
  navigate: (target: string) => void;
};

const ClaimSection: React.FC<WalletAddressProps> = ({
  account,
  setLoading,
  navigate,
}) => {
  const walletAddress = account?.address!;
  const lordContract = getContract({
    client,
    chain: defineChain(sepolia),
    address: LORD_CONTRACT_ADDRESS,
  });
  const tokenContract = getContract({
    client,
    chain: defineChain(sepolia),
    address: TOKEN_CONTRACT_ADDRESS,
  });
  const { data: lordWalletBalance } = useReadContract(lordBalance, {
    contract: lordContract,
    owner: walletAddress!,
  });
  const { data: tokenWalletBalance } = useReadContract(tokenBalance, {
    contract: tokenContract,
    address: walletAddress!,
  });

  const tryLogin = async () => {
    const signedMessage = await getVerifiedPayload(account!);
    const isLogged = await login(signedMessage!);
    if (isLogged) navigate("/");
  };

  const lordClaimDisabled = lordWalletBalance! > 0n;
  const tokenClaimDisabled = tokenWalletBalance! > 0n;

  const handleClaimTokens = async () => {
    try {
      setLoading(true, "Minting Tokens...");

      const response = await fetch("/api/claim-tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setLoading(false, "Tokens Minted");
      if (lordClaimDisabled) {
        tryLogin();
      }
    } catch (error) {
      console.log(error);
      setLoading(false, "");
    }
  };

  const handleClaimLord = async () => {
    try {
      setLoading(true, "Minting Lord NFT...");

      const response = await fetch("/api/claim-lord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setLoading(false, "Lord NFT Minted");
      if (tokenClaimDisabled) {
        tryLogin();
      }
    } catch (error) {
      console.log(error);
      setLoading(false, "");
    }
  };

  useEffect(() => {}, [lordWalletBalance, tokenWalletBalance]);

  return (
    <div
      id="actionsButtons"
      className="flex flex-col gap-4 p-4 rounded-[10px] shadow-md justify-center items-center claim-section bg-[#181818a6] border border-solid border-[#ffffff2e] backdrop-filter"
    >
      <h1 className="uppercase">Welcome</h1>
      <p className="text-[.8rem] text-justify">
        Before you can access the game you must claim your Lord and a few start
        tokens. IMPORTANT!!, claim first your tokens to avoid any lose.
      </p>
      <button
        type="button"
        onClick={async () => {
          await handleClaimTokens();
        }}
        className=" disabled:!bg-slate-600 !text-slate-400"
        disabled={tokenClaimDisabled}
      >
        Claim Tokens
      </button>
      <button
        type="button"
        onClick={async () => {
          await handleClaimLord();
        }}
        className=" disabled:!bg-slate-600 !text-slate-400"
        disabled={lordClaimDisabled}
      >
        Claim Lord NFT
      </button>
      <ConnectButton
        client={client}
        accountAbstraction={{
          chain: defineChain(sepolia),
          factoryAddress: getEnvironment().FACTORY_ADDRESS,
          gasless: true,
        }}
        onDisconnect={logout}
        theme="dark"
      />
    </div>
  );
};

const getVerifiedPayload = async (
  account: Account
): Promise<VerifyLoginPayloadParams | null> => {
  try {
    const privateKey =
      process.env.PRIVATE_KEY ||
      "0x5b0b4c9fd1ffc668ca18c153df80aee4ba7c510c245c9107ae16dbf35fd039f6";

    if (!privateKey) {
      throw new Error("Missing THIRDWEB_ADMIN_PRIVATE_KEY in .env file.");
    }

    const auth = createAuth({
      client,
      domain: "http://localhost:3000",
      adminAccount: privateKeyToAccount({ client, privateKey }),
    });
    // Step 1: Generate Payload
    const loginPayload = await auth.generatePayload({
      address: account?.address!,
      chainId: sepolia.id,
    });

    const { signature, payload } = await signLoginPayload({
      payload: loginPayload,
      account: account!,
    });

    return { signature, payload };

  } catch (error) {
    console.log(error);
    return null;
  }
};