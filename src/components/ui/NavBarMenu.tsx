"use client";
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaArrowAltCircleDown } from "react-icons/fa";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  icon,
  children,
  towable = true,
  link,
  otherClasses,
  onClick,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  icon?: ReactNode;
  children?: React.ReactNode;
  towable?: boolean;
  link?: string;
  otherClasses?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onMouseEnter={() => setActive(item)}
      className="relative "
      onClick={onClick}
    >
      <motion.div
        transition={{ duration: 0.3 }}
        className={`cursor-pointer flex items-center justify-center hover:opacity-[0.9] hover:scale-[1.1] text-white transition-all antialiased ${otherClasses}`}
      >
        {towable ? (
          <div className="flex w-full gap-2 items-center text-[1rem]">
            {icon}
            {item} <FaArrowAltCircleDown />
          </div>
        ) : (
          <div className="flex gap-2 items-center text-[1rem]">
            {icon}
            <Link href={link!}>{item}</Link>
          </div>
        )}
      </motion.div>
      {active !== null && towable && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="relative md:absolute top-0 md:top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-transparent md:bg-[#181818a6] rounded-[10px] border-none md:border md:border-solid border-[#ffffff2e] backdrop-filter text-white overflow-hidden  md:shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-0 md:p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative w-[98%]  my-0 mx-auto rounded-lg border border-solid border-[#ffffff2e]  shadow-input flex justify-between items-center gap-10  px-4 py-3 navbarContainer"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({
  children,
  icon,
  href,
}: {
  children: ReactNode;
  icon?: ReactNode;
  href: string;
}) => {
  return (
    <Link href={href} className=" text-white ">
      <div className="flex w-full items-center px-0 md:px-4 py-3 rounded-md justify-start gap-2 hover:bg-slate-500">
        {icon}
        {children}
      </div>
    </Link>
  );
};
