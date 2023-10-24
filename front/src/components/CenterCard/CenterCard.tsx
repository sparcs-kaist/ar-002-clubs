/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { CentercardList } from "../CentercardList";
import { SubTitle } from "../SubTitle";
import "./style.css";

interface Props {
  SubTitleText: string;
}

export const CenterCard = ({ SubTitleText }: Props): JSX.Element => {
  return (
    <div className="center-card">
      <div className={`rectangle`}>
        <div className="rectangle-2" />
        <div className="frame">
          <CentercardList />
          <CentercardList />
          <CentercardList />
          <CentercardList />
          <CentercardList />
          <CentercardList />
        </div>
      </div>
      <SubTitle text={SubTitleText} divClassName = "" className="" />
      <div className="text-wrapper-3">더보기&gt;</div>
    </div>
  );
};
