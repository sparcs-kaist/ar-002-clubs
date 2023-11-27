/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  property1: "variant-2" | "default";
  className?: any;
  divClassName?: any;
  text: string;
  clickHandler?: () => void;
}

export const OptionButton = ({
  property1,
  className,
  divClassName,
  text = "정기",
  clickHandler,
}: Props): JSX.Element => {
  return (
    <div
      className={`option-button ${property1} ${className}`}
      onClick={clickHandler}
      style={{ cursor: "pointer" }}
    >
      <div className={`text-wrapper-2 ${divClassName}`}>{text}</div>
    </div>
  );
};

OptionButton.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
  text: PropTypes.string,
};
