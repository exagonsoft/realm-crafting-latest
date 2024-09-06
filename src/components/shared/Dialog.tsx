import Image from "next/image";
import React from "react";

const Dialog = ({
  icon,
  title,
  message,
  onClose,
  onAccept,
}: {
  icon?: any;
  title: string;
  message: string;
  onClose?: () => void;
  onAccept?: () => void;
}) => {
  return (
    <div className="w-full h-screen fixed top-0 left-0 flex z-[900] justify-center items-center">
      <div className="w-full h-screen fixed backdrop-blur-[10px] z-[890]"></div>
      <div className="dialog_form">
        <Image
        width={80}
        height={80}
          src={icon ?? "/images/logo.png"}
          alt="Crafting Kingdoms"
          className="w-[80px] h-[80px] rounded-full"
        />
        <h2 className="flex font-bold">{title}</h2>
        <span className="text-[1rem] flex text-wrap text-center max-w-[80%]" >{message}</span>
        <div className="w-full flex justify-evenly items-center">
          {onClose && (
            <button onClick={onClose} className="dialog_form_buttom">
              Cancel
            </button>
          )}
          <button onClick={onAccept} className="dialog_form_buttom">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
