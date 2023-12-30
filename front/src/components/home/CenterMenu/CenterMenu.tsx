/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import Certifi from "assets/Images/Certification.png";
import { Unavailable } from "utils/util";

interface Props {
  divClassName: any;
  text: string;
}

export const CenterMenu = ({
  divClassName,
  text = "활동확인서 발급",
}: Props): JSX.Element => {
  return (
    <div
      className="center-menu"
      onClick={Unavailable}
      style={{ cursor: "pointer" }}
    >
      <div className={`text-wrapper-10 ${divClassName}`}>{text}</div>
      <div className="overlap-group">
        <img className="img" alt="Image" src={Certifi} />
      </div>
    </div>
  );
};

CenterMenu.propTypes = {
  text: PropTypes.string,
};
