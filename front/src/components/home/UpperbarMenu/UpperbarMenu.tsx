/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./UpperbarMenu.css";

interface Props {
  className: any;
  text: string;
  active: boolean;
}

export const UpperbarMenu = ({ className, text, active }: Props): JSX.Element => {
  const combinedClassName = active ? `${className} active` : className;
  return (
    <div className={`upper-menu ${combinedClassName}`}>
      <div className="text-wrapper">{text}</div>
    </div>
  );
};

UpperbarMenu.propTypes = {
  text: PropTypes.string,
};
