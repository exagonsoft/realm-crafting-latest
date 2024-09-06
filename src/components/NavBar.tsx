"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/NavBarMenu";
import { cn } from "@/utils/cn";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { client } from "@/lib/client";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import Image from "next/image";
import { displayBalance } from "@/utils/utilFunctions";
import { balanceOf as balanceOfShilen } from "thirdweb/extensions/erc20";
import { defineChain, getContract, toEther } from "thirdweb";
import { sepolia } from "thirdweb/chains";
import { TOKEN_CONTRACT_ADDRESS } from "@/constants/contracts";
import { FaBars, FaHome, FaMap, FaToolbox } from "react-icons/fa";
import { FaHouse, FaHouseFlag, FaShield, FaShop } from "react-icons/fa6";
import { motion } from "framer-motion";
import { MdClose } from "react-icons/md";
import useIsClient from "@/hooks/useIsClient";
import { inAppWallet } from "thirdweb/wallets";
import { getEnvironment } from "@/config/configs";

const sidebarVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  active: string | null;
  setActive: (item: string) => void;
}

const SideBar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onDisconnect,
  active,
  setActive,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      variants={sidebarVariants}
      className="absolute right-0 -top-2 p-2 px-4 z-50 w-full h-full flex justify-end items-start"
    >
      <div className="fixed left-0 top-0 w-screen h-screen z-30 backdrop-blur-[10px] bg-[#ffffff26]" onClick={() => {setActive(""); onClose()}}></div>
      <div className=" w-min rounded-md shadow-md relative z-40 p-4 h-auto backdrop-blur-[10px] bg-[#ffffff5d] flex flex-col justify-start items-center gap-4">
        <div
          className="w-full flex justify-end items-center"
          onClick={() => onClose()}
        >
          <div className="flex justify-center items-center p-2 bg-[#181818a6] rounded-[10px] border border-solid border-[#ffffff2e] backdrop-filter text-white text-[1.2rem]">
            <MdClose />
          </div>
        </div>
        <div className="flex flex-col justify-start gap-8 py-4 items-center px-2">
          <div className="flex flex-col gap-4 items-start justify-start">
            <MenuItem
              setActive={setActive}
              active={active}
              item="Home"
              icon={<FaHome />}
              towable={false}
              otherClasses="uppercase font-bold"
              link="/"
              onClick={() => onClose()}
            ></MenuItem>
            <MenuItem
              setActive={setActive}
              active={active}
              item="World Map"
              icon={<FaMap />}
              towable={false}
              otherClasses="uppercase font-bold"
              link="/world-map"
              onClick={() => onClose()}
            ></MenuItem>
            <MenuItem
              setActive={setActive}
              active={active}
              item="Buildings"
              icon={<FaHouse />}
              towable={true}
              otherClasses="uppercase font-bold"
            >
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/economy-buildings" icon={<FaShield />}>
                  Economic Buildings
                </HoveredLink>
                <HoveredLink href="/military-buildings" icon={<FaToolbox />}>
                  Military Buildings
                </HoveredLink>
              </div>
            </MenuItem>
            <MenuItem
              setActive={setActive}
              active={active}
              item="Tavern"
              icon={<FaHouseFlag />}
              towable={false}
              otherClasses="uppercase font-bold"
              link="/tavern"
              onClick={() => onClose()}
            ></MenuItem>
            <MenuItem
              setActive={setActive}
              active={active}
              item="MarketPlace"
              icon={<FaShop />}
              towable={false}
              otherClasses="uppercase font-bold"
              link="/marketplace"
              onClick={() => onClose()}
            ></MenuItem>
          </div>
          <div className="navbarOptions">
            <ConnectButton
              client={client}
              autoConnect= { {timeout: 120000} }
              accountAbstraction={{
                chain: defineChain(sepolia),
                factoryAddress: getEnvironment().FACTORY_ADDRESS,
                gasless: true,
              }}
              onDisconnect={onDisconnect}
              theme="dark"
              wallets={[inAppWallet()]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NavBar = ({ className }: { className?: string }) => {
  const { checkAuth, navigate, isLoginPage } = useAuth();
  const [active, setActive] = useState<string | null>(null);
  const [showSideBar, setShowSideBar] = useState(false);
  const account = useActiveAccount();
  const isClient = useIsClient();
  const { data: tokenBalance } = useReadContract(balanceOfShilen, {
    contract: getContract({
      client,
      chain: defineChain(sepolia),
      address: TOKEN_CONTRACT_ADDRESS,
    }),
    address: account?.address! || "",
  });

  const isMobile = isClient ? window.innerWidth < 750 : false;

  const logOut = async () => {
    await logout();
    checkLoggedIn();
  };

  const checkLoggedIn = async () => {

    const _isLogged = await checkAuth();

    if (!_isLogged) {
      navigate("/login");
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  useEffect(() => {}, [tokenBalance])

  return (
    <>
      {!isLoginPage && (
        <div
          className={cn(
            "fixed top-10 inset-x-0 max-w-2xl mx-auto z-[500]",
            className
          )}
        >
          {isMobile && (
            <SideBar
              onClose={() => setShowSideBar(false)}
              isOpen={showSideBar}
              onDisconnect={logOut}
              active={active}
              setActive={setActive}
            />
          )}
          <Menu setActive={setActive}>
            <div className="flex w-auto">
              <Link href="/">
                <div className="flex gap-4 justify-center items-center">
                  <Image
                    width={60}
                    height={60}
                    src="/images/logo.png"
                    alt="Logo"
                    className="w-[60px] h-[60px] rounded-full"
                    priority
                  />
                  {!isMobile && (
                    <div className="flex flex-col justify-center items-center font-light leading-[1.1]">
                      <span className="text-[1.3rem]">CRAFTING</span>
                      <span className="text-[1rem]">KINGDOMS</span>
                    </div>
                  )}
                </div>
              </Link>
            </div>
            {!isMobile && (
              <div className="w-auto flex justify-end items-center gap-6">
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="World Map"
                  icon={<FaMap />}
                  towable={false}
                  otherClasses="uppercase font-bold"
                  link="/world-map"
                ></MenuItem>
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Buildings"
                  icon={<FaHouse />}
                  towable={true}
                  otherClasses="uppercase font-bold"
                >
                  <div className="flex flex-col space-y-4 text-md ">
                    <HoveredLink href="/secure/economy-buildings" icon={<FaToolbox />} >
                      Economic Buildings
                    </HoveredLink>
                    <HoveredLink
                      href="/secure/military-buildings"
                      icon={<FaShield />}
                    >
                      Military Buildings
                    </HoveredLink>
                  </div>
                </MenuItem>
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="Tavern"
                  icon={<FaHouseFlag />}
                  towable={false}
                  otherClasses="uppercase font-bold"
                  link="/tavern"
                ></MenuItem>
                <MenuItem
                  setActive={setActive}
                  active={active}
                  item="MarketPlace"
                  icon={<FaShop />}
                  towable={false}
                  otherClasses="uppercase font-bold"
                  link="/marketplace"
                ></MenuItem>
              </div>
            )}
            <div className="navbarOptions w-auto">
              {tokenBalance && (
                <div className="flex justify-center items-center gap-2 m-0 text-[.9rem] font-light text-white cursor-pointer transition-colors bg-[#181818a6] rounded-[10px] border border-solid border-[#ffffff2e] backdrop-filter px-4 py-[8px]">
                  {displayBalance(toEther(tokenBalance || 0n))}
                  <div className="flex flex-col gap-1 items-center justify-center w-max">
                    <Image
                      width={15}
                      height={15}
                      src="/images/coin.png"
                      alt="Shilen"
                    />
                    <span className="text-[.8rem] text-[#7c7a85] font-light">
                      SHN
                    </span>
                  </div>
                </div>
              )}
              {!isMobile ? (
                <ConnectButton
                  client={client}
                  autoConnect= { {timeout: 120000} }
                  accountAbstraction={{
                    chain: defineChain(sepolia),
                    factoryAddress: getEnvironment().FACTORY_ADDRESS,
                    gasless: true,
                  }}
                  onDisconnect={logOut}
                  theme="dark"
                  wallets={[inAppWallet()]}
                />
              ) : (
                <div
                  className="flex justify-center items-center p-2 bg-[#181818a6] rounded-[10px] border border-solid border-[#ffffff2e] backdrop-filter text-white text-[1.2rem]"
                  onClick={() => setShowSideBar((prevState) => !prevState)}
                >
                  <FaBars />
                </div>
              )}
            </div>
          </Menu>
        </div>
      )}
    </>
  );
};

export default NavBar;
