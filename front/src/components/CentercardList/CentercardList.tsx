/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import "./style.css";

interface Props {
  title: string;
  subtitle: string;
  url: string;
}

export const CentercardList = ({title, subtitle, url}:Props): JSX.Element => {
  const handleClick = () => {
    window.open(url, '_blank');
  };
  return (
    <div className="centercard-list" onClick={handleClick} style={{cursor: 'pointer'}}>
      <div className="text-wrapper">{title}</div>
      <div className="div">{subtitle}</div>
    </div>
  );
};
