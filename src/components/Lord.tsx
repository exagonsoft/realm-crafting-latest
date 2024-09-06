"use client";
import React, { useEffect, useState } from "react";
import {
  STACKING_MILITARY_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants/contracts";
import LoadingAnimation from "./shared/LoadingAnimator";
import { KingdomData } from "@/types/kingdomData";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "@/lib/client";
import { balanceOf as balanceOfShilen } from "thirdweb/extensions/erc20";
import { defineChain, getContract, NFT, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import Image from "next/image";

const OverallItem = ({
  image,
  quantity,
  title,
}: {
  image: string;
  quantity?: number;
  title: string;
}) => {
  useEffect(() => {}, [quantity]);
  return (
    <div className="w-full rounded-[10px] shadow-md flex gap-4 justify-start items-center">
      <MediaRenderer
        client={client}
        src={image}
        className="rounded-[10px] !w-[60px] !h-[60px] md:!w-[120px] md:!h-[120px] border-[3px] border-[#efa92799]  shadow-[#b3751de3] shadow-inner"
      />
      <div className="flex flex-col gap-2 items-start justify-start">
        <span className="font-light text-[.8rem] md:text-[1rem]">{`${title}`}</span>
        <span className="font-light text-[.8rem] md:text-[1rem]">{`Owned: ${
          quantity?.toString() ?? "0"
        }`}</span>
      </div>
    </div>
  );
};

const Lord = () => {
  const account = useActiveAccount();
  const { data: stakedTokens, isLoading: loadingWorkShops } = useReadContract({
    contract: getContract({
      client: client,
      chain: defineChain(sepolia),
      address: STAKING_CONTRACT_ADDRESS,
    }),
    method:
      "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256[] _tokenAmounts, uint256 _totalRewards)",
    params: [account?.address!],
  });
  const { data: stakedMilitaryTokens, isLoading: loadingMilitaryBulidings } =
    useReadContract({
      contract: getContract({
        client: client,
        chain: defineChain(sepolia),
        address: STACKING_MILITARY_CONTRACT_ADDRESS,
      }),
      method:
        "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256[] _tokenAmounts, uint256 _totalRewards)",
      params: [account?.address!],
    });
  const [isLoading, setIsLoading] = useState(false);
  const [ownedLord, setOwnedLords] = useState(Array<NFT>);
  const [kingdomData, setKingdomData] = useState<KingdomData>();

  const { data: tokenBalance, isLoading: loadingTokenBalance } =
    useReadContract(balanceOfShilen, {
      contract: getContract({
        client,
        chain: defineChain(sepolia),
        address: TOKEN_CONTRACT_ADDRESS,
      }),
      address: account?.address! || "",
    });

  const _displayBalance = (num: string) => {
    return num.slice(0, 4);
  };

  const getLordsNFTs = async () => {
    try {
      setIsLoading(true);
      if (account) {
        const response = await fetch("/api/get-owned-lords", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress: account?.address! }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }
        const _owned_lords = JSON.parse(data.message);

        setOwnedLords(_owned_lords);
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const checkOwnedBuildings = () => {
    if (stakedTokens && stakedTokens[0].length > 0) {
      let _quantity = 0;
      stakedTokens[1].map((tokenQtity: bigint) => {
        _quantity += parseFloat(tokenQtity.toString());
      });

      setKingdomData((prevState) => ({
        ...prevState!,
        economyBuildings: _quantity,
      }));
    }

    if (stakedMilitaryTokens && stakedMilitaryTokens[0].length > 0) {
      let _quantity = 0;
      stakedMilitaryTokens[1].map((tokenQtity: bigint) => {
        _quantity += parseFloat(toEther(tokenQtity));
      });
      setKingdomData((prevState) => ({
        ...prevState!,
        militaryBuildings: _quantity,
      }));
    }
  };

  useEffect(() => {
    getLordsNFTs();
    checkOwnedBuildings();
  }, [account]);

  useEffect(() => {
    checkOwnedBuildings();
  }, [ownedLord, stakedTokens]);

  useEffect(() => {}, [tokenBalance]);

  return (
    <div
      className={
        isLoading || loadingTokenBalance
          ? "relative top-2 flex w-full md:w-[33%] justify-center items-center min-h-[14rem] bg-[#ffffff26] backdrop-blur-[10px] border border-[#ffffff2e] rounded-[10px]"
          : "w-full md:w-[33%]"
      }
    >
      {!isLoading &&
      !loadingTokenBalance &&
      !loadingWorkShops &&
      !loadingMilitaryBulidings ? (
        <div
          className="flex flex-col justify-start items-start gap-8 bg-[#ffffff26] backdrop-blur-[10px] border border-[#ffffff2e] p-4 md:p-8 rounded-[10px] m-0 md:m-[10px] min-h-[20rem]"
        >
          <span className="w-full flex justify-center items-center text-[1rem] md:text-[1.2rem] font-bold mt-4">
            Kingdom Overall:
          </span>
          <div className="w-full flex gap-4">
            <MediaRenderer
              client={client}
              src={ownedLord.length > 0 ? ownedLord[0].metadata?.image : ''}
              className="rounded-[10px] !w-[80px] !h-[80px] md:!w-[120px] md:!h-[120px] border-[3px] border-[#efa92799]  shadow-[#b3751de3] shadow-inner"
            />
            <div className="flex flex-col gap-2 items-start justify-start">
              <span className="font-light text-[.8rem] md:text-[1rem]">{ownedLord.length > 0 ? ownedLord[0].metadata?.name : ''}</span>
              {tokenBalance && (
                <span className="text-[.8rem] md:text-[1rem] flex gap-1 items-center">
                  {`${_displayBalance(toEther(tokenBalance))} SHN`}
                  <Image
                    src="/images/coin.png"
                    alt="Shien"
                    width={14}
                    height={14}
                    className="h-[14px] w-[14px]"
                  />
                </span>
              )}
            </div>
          </div>
          <div className="w-full !p-0 md:!p-4 flex flex-col gap-4 !m-0">
            <OverallItem
              image={"/images/city.png"}
              title={"WorkShops"}
              quantity={kingdomData?.economyBuildings}
            />
            <OverallItem
              image={"/images/outpost.png"}
              title={"Academies"}
              quantity={kingdomData?.militaryBuildings}
            />
            <OverallItem
              image={"/images/hero.png"}
              title={"Heroes"}
              quantity={kingdomData?.heroes}
            />
            <OverallItem
              image={"/images/generic_item.png"}
              title={"Items"}
              quantity={kingdomData?.items}
            />
          </div>
        </div>
      ) : (
        <LoadingAnimation />
      )}
    </div>
  );
};

export default Lord;
