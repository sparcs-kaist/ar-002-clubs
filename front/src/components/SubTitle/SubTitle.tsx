/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  className: any;
  divClassName: any;
  text: string;
}

export const SubTitle = ({ className, divClassName, text = "카페 공지사항" }: Props): JSX.Element => {
  return (
    <div className={`sub-title ${className}`}>
      <div className={`text-wrapper-8 ${divClassName}`}>{text}</div>
    </div>
  );
};

SubTitle.propTypes = {
  text: PropTypes.string,
};
