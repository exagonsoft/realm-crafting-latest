import React, { useEffect, useState } from "react";
import {
  BUILDINGS_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS,
} from "../constants/contracts";
import {
  MediaRenderer,
  TransactionButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { client } from "@/lib/client";
import {
  Address,
  defineChain,
  getContract,
  NFT,
  prepareContractCall,
  toEther,
} from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { balanceOf as balanceOfShilen } from "thirdweb/extensions/erc20";
import { claimTo } from "thirdweb/extensions/erc1155";
import Image from "next/image";

type Props = {
  building: NFT;
  showDialog: (title: string, message: string) => void;
  setIsBusy: (state: boolean) => void;
};

const RealmWorkShopCard = ({ building, showDialog, setIsBusy }: Props) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const { data: tokenBalance } = useReadContract(balanceOfShilen, {
    contract: getContract({
      client,
      chain: defineChain(sepolia),
      address: TOKEN_CONTRACT_ADDRESS,
    }),
    address: account?.address! || "",
  });

  const buildingContract = getContract({
    client: client,
    chain: defineChain(sepolia),
    address: BUILDINGS_CONTRACT_ADDRESS,
  });
  const { data: claimCondition, isLoading: loadingConditions } =
    useReadContract({
      contract: buildingContract,
      method:
        "function getClaimConditionById(uint256 _tokenId, uint256 _conditionId) view returns ((uint256 startTimestamp, uint256 maxClaimableSupply, uint256 supplyClaimed, uint256 quantityLimitPerWallet, bytes32 merkleRoot, uint256 pricePerToken, address currency, string metadata) condition)",
      params: [building.id, 0n],
    });
  const stakingContract = getContract({
    client: client,
    chain: defineChain(sepolia),
    address: STAKING_CONTRACT_ADDRESS,
  });
  const { data: stakeApproved, isLoading: loadingStakeApproved } =
    useReadContract({
      contract: stakingContract,
      method:
        "function isApprovedForAll(address _owner, address _operator) view returns (bool)",
      params: [account?.address!, stakingContract?.address! as Address],
    });
  const [claimState, setClaimState] = useState<"init" | "nftClaim" | "staking">(
    "init"
  );

  const calculateBuildingEarnings = (cost: number) => {
    return cost * 0.01;
  };

  useEffect(() => {
  }, [building, claimCondition]);

  return (
    <div className="nftCard">
      <div className="nft_card_ui">
        <Image
          width={500}
          height={500}
          src={"/images/building_card_bg.png"}
          alt=""
          className="w-full h-full object-fill"
        />
      </div>

      <div className="w-full h-full min-h-[28rem] absolute z-[80]">
        <MediaRenderer
          client={client}
          src={building.metadata.image}
          className="!w-full !h-full !object-fill"
        />
      </div>

      <div className="building_texts">
        <h4>{building.metadata.name}</h4>
        {claimCondition && (
          <div className="building_texts_info_wrapper">
            <div className="building_texts_info_container">
              <div className="">
                <span className="text-[.9rem] font-bold" >Cost: </span>
              </div>
              <div className="flex w-full gap-2 items-center">
                <span className="flex w-full gap-2 items-center text-[.8rem]">
                  {toEther(claimCondition.pricePerToken)}{" "}
                  <img src="/images/coin.png" alt="" className="coin_image" />
                  SHN
                </span>
              </div>
            </div>
            <div className="building_texts_info_container">
              <div className="">
                <span className="text-[.9rem] font-bold">Earns /h:</span>
              </div>
              <div className="">
                <span className="flex w-full gap-2 items-center text-[.8rem]">
                  {calculateBuildingEarnings(
                    parseInt(toEther(claimCondition.pricePerToken))
                  )}{" "}
                  <img src="/images/coin.png" alt="" className="coin_image" />
                  SHN
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <TransactionButton
        transaction={() => {
          if (!account?.address) throw new Error("Error claiming building");
          setClaimState("nftClaim");
          const _claimPrice = claimCondition?.pricePerToken;
          if (tokenBalance! >= _claimPrice!) {
            return claimTo({
              contract: buildingContract,
              to: account?.address!,
              tokenId: building?.id,
              quantity: 1n,
            });
          } else {
            showDialog('Error', 'Insufficient founds!!');
            setClaimState("init");
            throw new Error("Not enough balance");
          }
        }}
        onTransactionSent={() => {
          setIsBusy(true);
          setClaimState("staking");
        }}
        onTransactionConfirmed={() => {
          if (!stakeApproved) {
            const transaction = prepareContractCall({
              contract: buildingContract,
              method:
                "function setApprovalForAll(address _operator, bool _approved)",
              params: [stakingContract.address as Address, true],
            });
            const options = {
              chain: defineChain(sepolia),
              client,
              onSuccess: (result: any) => {
                const transaction = prepareContractCall({
                  contract: stakingContract,
                  method: "function stake(uint256 _tokenId, uint64 _amount)",
                  params: [building.id, 1n],
                });

                const stakeOptions = {
                  chain: defineChain(sepolia),
                  client,
                  onSuccess: (result: any) => {
                    setIsBusy(false);
                    showDialog(
                      "Success",
                      "You have successfully build your workshop!!"
                    );
                  },
                  onError: (error: any) => {
                    console.log();
                    setIsBusy(false);
                    showDialog("Error", "Exception throw staking building!!");
                  },
                };
                sendTransaction(transaction, stakeOptions);
              },
              onError: (error: any) => {
                console.log();
                setIsBusy(false);
                showDialog("Error", "Exception throw approving stake method!!");
              },
            };
            sendTransaction(transaction, options);
          }
        }}
        onError={(error) => {
          showDialog('Error', error.message);
        }}
        className="nftCardButton"
      >
        {claimState === "nftClaim"
          ? "Building..."
          : claimState === "staking"
          ? "Staking..."
          : "Build Workshop"}
      </TransactionButton>
    </div>
  );
};

export default RealmWorkShopCard;
