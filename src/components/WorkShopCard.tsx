import { getNFTs, getNFT } from "thirdweb/extensions/erc1155";
import React, { useEffect, useState } from "react";
import {
  BUILDINGS_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
} from "../constants/contracts";
import { BaseContract } from "ethers";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import {
  defineChain,
  getContract,
  prepareContractCall,
  ThirdwebContract,
  toEther,
} from "thirdweb";
import { client } from "@/lib/client";
import { sepolia } from "thirdweb/chains";
import Image from "next/image";

type Props = {
  tokenId: bigint;
  claimEarnings: () => void;
  onBusy: (state: boolean) => void;
};

const WorkShopCard = ({ tokenId, claimEarnings, onBusy }: Props) => {
  const account = useActiveAccount();
  const [buildingNumbers, setBuildingNumbers] = useState(0);
  const { mutate: sendTransaction } = useSendTransaction();
  const { data: workShopNft } = useReadContract(getNFT, {
    contract: getContract({
      client: client,
      chain: defineChain(sepolia),
      address: BUILDINGS_CONTRACT_ADDRESS,
    }),
    tokenId: tokenId,
  });
  const { data: workShopRewards } = useReadContract({
    contract: getContract({
      client: client,
      chain: defineChain(sepolia),
      address: STAKING_CONTRACT_ADDRESS,
    }),
    method:
      "function getStakeInfoForToken(uint256 _tokenId, address _staker) view returns (uint256 _tokensStaked, uint256 _rewards)",
    params: [tokenId, account?.address!],
  });

  const handleClaimRewards = async () => {
    onBusy(true);

    const transaction = prepareContractCall({
      contract: getContract({
        client: client,
        chain: defineChain(sepolia),
        address: STAKING_CONTRACT_ADDRESS,
      }),
      method: "function claimRewards(uint256 _tokenId)",
      params: [tokenId],
    });

    const options = {
      chain: defineChain(sepolia),
      client,
      onSuccess: (result: any) => {
        console.log("Transaction successful:", result);
        claimEarnings();
        onBusy(false); // Reset the busy state
      },
      onError: (error: any) => {
        console.error("Error sending transaction:", error);
        // Handle error (e.g., show an error message to the user)
        onBusy(false); // Reset the busy state
      },
    };

    sendTransaction(transaction, options);
  };

  const truncateRevenue = (revenue: bigint) => {
    const convertToEther = toEther(revenue);
    const truncateValue = convertToEther.toString().slice(0, 6);
    return truncateValue;
  };

  useEffect(() => {
    if (workShopRewards && workShopRewards[1]) {
      setBuildingNumbers(parseFloat(workShopRewards[0].toString()));
    }
  }, [workShopRewards]);

  useEffect(() => {}, [buildingNumbers]);

  return (
    <div className="rounded-[40px] flex flex-col justify-between items-start relative shadow-lg max-w-full md:max-w-[350px] min-h-[20rem] md:min-h-[400px] min-w-[90%] md:min-w-[300px]">
      <div className="nft_owned_card_ui">
        <Image
          width={500}
          height={500}
          src={"/images/owned_building_card_bg.png"}
          alt=""
          className="w-full h-full object-fill"
        />
      </div>
      <div className="w-full h-full  absolute z-[80]">
        <MediaRenderer
          client={client}
          src={workShopNft?.metadata.image}
          className="!w-full !h-full !object-fill rounded-[40px]"
        />
      </div>
      <div className="building_texts">
        <h4>{workShopNft?.metadata.name}</h4>
        <div className="owned_buildings_text_info_container">
          <span>
            Earnings:{" "}
            {workShopRewards ? truncateRevenue(workShopRewards[1]) : ""}
          </span>
          <img src="/images/coin.png" alt="" className="" />
        </div>
      </div>
      <div className="nftHomeCardButton_jewel">
        <span>{buildingNumbers > 0 ? buildingNumbers : 0}</span>
      </div>
      <button
        type="button"
        onClick={handleClaimRewards}
        className="!w-fit py-1 px-2 md:py-[.4rem] md:px-4 rounded-[15px] md:rounded-[20px] border-double border-[3px] bottom-[.4rem] md:bottom-[.6rem] left-[20%] nftHomeCardButton"
      >
        Claim Earnings
      </button>
    </div>
  );
};

export default WorkShopCard;
