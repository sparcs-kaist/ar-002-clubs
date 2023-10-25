import React from "react";
import "./UnderBar.css";
import Logo from "assets/Images/Logo.png";

export const UnderBar = (): JSX.Element => {
  return (
    <div className="under-bar">
      <div className="group">
        <img className="image" alt="Image" src={Logo} />
        <div className="text-wrapper">ClubsUnion</div>
      </div>
      <div className="div">
        <div className="text-wrapper-2">만든사람들</div>
        <div className="text-wrapper-2">라이센스</div>
        <div className="text-wrapper-2">개인정보취급방침</div>
      </div>
      <a className="text-wrapper-3" href="mailto:clubsunion2019@gmail.com" rel="noopener noreferrer" target="_blank">
        clubsunion2019@gmail.com
      </a>
    </div>
  );
};