/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import "./style.css";

interface Props {
  className: any;
}

export const CalendarDay = ({ className }: Props): JSX.Element => {
  return (
    <div className={`calendar-day ${className}`}>
      <div className="overlap">
        <div className="text-wrapper-11">1</div>
        <div className="overlap-group-wrapper">
          <div className="overlap-group-2">
            <div className="ellipse-2" />
            <div className="text-wrapper-12">3</div>
          </div>
        </div>
      </div>
    </div>
  );
};
