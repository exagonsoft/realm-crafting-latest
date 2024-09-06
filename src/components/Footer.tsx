import React from "react";
import "./footerStyles.css";

const Footer = () => {
  return (
    <div className="footer_container !flex-col md:!flex-row">
      <div className="!w-full md:!w-[20%]">
        <span className="font-bold text-[1rem] md:text-[1.2rem]">
          Powered By
        </span>
        <hr
          className=""
          style={{ width: "50%", display: "flex", margin: "0 0 .3rem 0" }}
        />
        <div className="footer_powered_container">
          <span className="flex items-center gap-4 text-[.8rem] md:text-[1rem]">
            <img
              src="/images/exagon_soft_logo.png"
              alt=""
              className="footer_powered_img"
            />
            EXAGON-SOFT
          </span>
          <span className="flex items-center gap-4 text-[.8rem] md:text-[1rem]">
            <img
              src="/images/third_web_logo.png"
              alt=""
              className="footer_powered_img"
            />
            THIRDWEB
          </span>
          <span className="flex items-center gap-4 text-[.8rem] md:text-[1rem]">
            <img
              src="/images/poligon_logo.png"
              alt=""
              className="footer_powered_img"
            />
            POLIGON
          </span>
        </div>
      </div>
      <div className="!w-full md:!w-[50%]"></div>
      <div className="!w-full md:!w-[20%]"></div>
    </div>
  );
};

export default Footer;
