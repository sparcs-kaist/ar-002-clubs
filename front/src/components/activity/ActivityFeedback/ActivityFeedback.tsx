/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./ActivityFeedback.css";

interface Props {
  text: string;
  text1: string;
}

export const ActivityFeedback = ({
  text = "2023.12.31 19:58:00",
  text1 = "증빙 사진1의 인원이 맞지 않습니다.<br/>증빙 사진2의 장소가 맞지 않습니다.",
}: Props): JSX.Element => {
  return (
    <div className={`activity-feedback`}>
      <div className="element-wrapper">
        <div className="element">{text}</div>
      </div>
      <div className="div-wrapper">
        <p className="p">{text1}</p>
      </div>
    </div>
  );
};

ActivityFeedback.propTypes = {
  text: PropTypes.string,
  text1: PropTypes.string,
};
