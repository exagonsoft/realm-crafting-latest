"use client";
import BusyPanel from "@/components/BussyPanel";
import Lord from "@/components/Lord";
import Dialog from "@/components/shared/Dialog";
import WorkShops from "@/components/WorkShops";
import { buildingsIds, STAKING_CONTRACT_ADDRESS } from "@/constants/contracts";
import { client } from "@/lib/client";
import { KingdomData } from "@/types/kingdomData";
import { Suspense, useEffect, useState } from "react";
import { defineChain, getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";

export default function Home() {
  const [showDialog, setShowDialog] = useState(false);
  const [showBusyPanel, setShowBusyPanel] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const address = useActiveAccount();

  const onEarningsClaimed = () => {
    document.body.style.overflowY = "hidden";
    setShowDialog(true);
  };

  const onDialogClose = () => {
    document.body.style.overflowY = "auto";
    setShowDialog(false);
  };

  const onBusy = (busy: boolean) => {
    if (busy) {
      document.body.style.overflowY = "hidden";
      setShowBusyPanel(true);
    } else {
      document.body.style.overflowY = "auto";
      setShowBusyPanel(false);
    }
    setIsBusy(busy);
  };

  // const updateKingdomData = (target: string, value: number | boolean) => {
  //   setKingdomData((prevState) => ({ ...prevState!, [target!]: value! }));
  // };

  // useEffect(() => {}, [kingdomData])
  return (
    <div className="w-full flex flex-col md:flex-row gap-4">
      {showBusyPanel && <BusyPanel />}
      {showDialog && (
        <Dialog
          title={"Success"}
          message={"Earnings claimed successfully!!"}
          onAccept={onDialogClose}
        />
      )}
      <Suspense fallback={'Loading Kingdom Data...'}>
        <Lord />
      </Suspense>
      <WorkShops setBusy={onBusy} onEarningsClaimed={onEarningsClaimed} />
    </div>
  );
}
