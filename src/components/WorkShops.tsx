import React, { useEffect, useState } from "react";
import { buildingsIds, STACKING_MILITARY_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS } from "../constants/contracts";
import WorkShopCard from "./WorkShopCard";
import LoadingAnimation from "./shared/LoadingAnimator";
import { client } from "@/lib/client";
import { getContract, defineChain, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import "./workshopsStyles.css";

const WorkShops = ({
  onEarningsClaimed,
  setBusy,
}: {
  onEarningsClaimed: () => void;
  setBusy: (state: boolean) => void;
}) => {
  const account = useActiveAccount();
  const [economyBuildings, setEconomyBuildings] = useState([
    {
      buildingID: Number(),
      quantity: Number(),
    },
  ]);
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

  const { data: stakedMilitaryTokens, isLoading: loadingOutposts } = useReadContract({
    contract: getContract({
      client: client,
      chain: defineChain(sepolia),
      address: STACKING_MILITARY_CONTRACT_ADDRESS,
    }),
    method:
      "function getStakeInfo(address _staker) view returns (uint256[] _tokensStaked, uint256[] _tokenAmounts, uint256 _totalRewards)",
    params: [account?.address!],
  });

  const getStakedTokes = () => {
    try {
      if (account) {
        if (stakedTokens && stakedTokens[0].length > 0) {
          let _economyBuildings = economyBuildings;
          stakedTokens[0].map((stakedToken: bigint) => {
            let _exist = _economyBuildings.filter(
              (object) => object.buildingID === parseFloat(toEther(stakedToken))
            );
            if (_exist.length === 0) {
              _economyBuildings.push({
                buildingID: parseFloat(toEther(stakedToken)),
                quantity: 0,
              });
            }
          });
          setEconomyBuildings(_economyBuildings);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStakedTokes();
  }, [account]);

  useEffect(() => {}, [stakedTokens, economyBuildings])

  return (
    <div className="w-full md:w-[70%] flex flex-col gap-4">
      <div className="businessContainer">
        {!loadingWorkShops ? (
          <>
            <h2
              className="w-full flex justify-center items-center text-[1.2rem] font-bold"
            >
              WorkShops
            </h2>
            <div className="grid">
              {stakedTokens && stakedTokens[0].length > 0 ? (
                stakedTokens[0].map((stakedToken: bigint, indx) => (
                  <WorkShopCard
                    key={indx}
                    tokenId={stakedToken}
                    claimEarnings={onEarningsClaimed}
                    onBusy={setBusy}
                  />
                ))
              ) : (
                <p>No workshops owned...</p>
              )}
            </div>
          </>
        ) : (
          <LoadingAnimation />
        )}
      </div>
      <div className="businessContainer">
        {!loadingOutposts ? (
          <>
            <h3
              className=""
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Military Outposts
            </h3>
            <div className="grid">
              {stakedMilitaryTokens && stakedMilitaryTokens[0].length > 0 ? (
                stakedMilitaryTokens[0].map((stakedMilitaryToken: bigint, indx) => <></>)
              ) : (
                <p>No outposts owned...</p>
              )}
            </div>
          </>
        ) : (
          <LoadingAnimation />
        )}
      </div>
      <div className="businessContainer">
        {!loadingWorkShops ? (
          <>
            <h3
              className=""
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Heroes
            </h3>
            <div className="grid">
              {stakedTokens && stakedTokens[0].length > 0 ? (
                stakedTokens[0].map((stakedToken: bigint) => <></>)
              ) : (
                <p>No heroes owned...</p>
              )}
            </div>
          </>
        ) : (
          <LoadingAnimation />
        )}
      </div>
      <div className="businessContainer">
        {!loadingWorkShops ? (
          <>
            <h3
              className=""
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Items
            </h3>
            <div className="grid">
              {stakedTokens && stakedTokens[0].length > 0 ? (
                stakedTokens[0].map((stakedToken: bigint) => <></>)
              ) : (
                <p>No items owned...</p>
              )}
            </div>
          </>
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </div>
  );
};

export default WorkShops;
