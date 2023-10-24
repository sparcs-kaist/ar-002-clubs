/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  className: any;
  text: string;
}

export const UpperbarMenu = ({ className, text = "동아리" }: Props): JSX.Element => {
  return (
    <div className={`upperbar-menu ${className}`}>
      <div className="text-wrapper">{text}</div>
    </div>
  );
};

UpperbarMenu.propTypes = {
  text: PropTypes.string,
};
