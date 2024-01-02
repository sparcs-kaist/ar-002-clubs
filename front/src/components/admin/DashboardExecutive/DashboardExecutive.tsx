/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  title: "zero" | "one";
  className: any;
  text: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  text6: string;
  text7: string;
}

export const DashboardExecutive = ({
  title,
  className,
  text = "#",
  text1 = "집행부원",
  text2 = "검토전",
  text3 = "승인됨",
  text4 = "반려됨",
  text5 = "전체 검토",
  text6 = "전체 담당",
  text7 = "완료율",
}: Props): JSX.Element => {
  return (
    <div className={`dashboard-executive title-0-${title} ${className}`}>
      <div className="element-wrapper">
        <div className="element-2">{text}</div>
      </div>
      <div className="frame-4">
        <div className="text-wrapper-3">{text1}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text2}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text3}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text4}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text5}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text6}</div>
      </div>
      <div className="frame-5">
        <div className="text-wrapper-3">{text7}</div>
      </div>
    </div>
  );
};

DashboardExecutive.propTypes = {
  title: PropTypes.oneOf(["zero", "one"]),
  text: PropTypes.string,
  text1: PropTypes.string,
  text2: PropTypes.string,
  text3: PropTypes.string,
  text4: PropTypes.string,
  text5: PropTypes.string,
  text6: PropTypes.string,
  text7: PropTypes.string,
};
