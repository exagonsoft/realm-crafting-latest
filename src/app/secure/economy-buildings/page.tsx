"use client"

import BusyPanel from "@/components/BussyPanel";
import RealmWorkShopCard from "@/components/RealmWorkShopCard";
import Dialog from "@/components/shared/Dialog";
import LoadingAnimation from "@/components/shared/LoadingAnimator";
import { BUILDINGS_CONTRACT_ADDRESS } from "@/constants/contracts";
import React, { useState } from "react";
import "./economyBuildingStyles.css";
import { getNFTs } from "thirdweb/extensions/erc1155";
import { useReadContract } from "thirdweb/react";
import { defineChain, getContract, NFT, toEther } from "thirdweb";
import { client } from "@/lib/client";
import { sepolia } from "thirdweb/chains";

const EconomyBuildings = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [sortedWorkshops, setSortedWorkShops] = useState(Array<NFT>);
  const [dialogData, setDialogData] = useState({
    title: "",
    message: "",
  });

  const { data: workshops, isLoading: loadingWorkshops, error: workshopsError } = useReadContract(getNFTs, {
    contract: getContract({
      client: client,
      chain: defineChain(sepolia),
      address: BUILDINGS_CONTRACT_ADDRESS
    }),
  })

  const onShowDialog = (title: string, message: string) => {
    setDialogData({ title, message });
    document.body.style.overflowY = "hidden";
    setShowDialog(true);
  };

  const onDialogClose = () => {
    setDialogData({ title: "", message: "" });
    document.body.style.overflowY = "auto";
    setShowDialog(false);
  };

  const onBusy = (busy: boolean) => {
    if (busy) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "auto";
    }
    setIsBusy(busy);
  };



  return (
    <div className="workshops_layout_container">
      {showDialog && (
        <Dialog
          title={dialogData.title}
          message={dialogData.message}
          onAccept={onDialogClose}
        />
      )}
      {isBusy && <BusyPanel />}
      <h1 className="section_title">Available Buildings</h1>
      <div
        className={
          !workshops || workshops.length < 0
            ? "grid_loading_container"
            : "grid_containers"
        }
      >
        {workshops && workshops.length > 0 ? (
          workshops.sort((a, b) => parseFloat(toEther(a.id)) - parseFloat(toEther(b.id))).map((workshop) => (
            <RealmWorkShopCard
              key={workshop.id}
              building={workshop}
              showDialog={onShowDialog}
              setIsBusy={onBusy}
            />
          ))
        ) : (
          <LoadingAnimation />
        )}
      </div>
    </div>
  );
};

export default EconomyBuildings;
