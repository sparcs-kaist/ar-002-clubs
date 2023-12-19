/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  property1: "variant-2" | "default";
  className: any;
}

export const ActivityProof = ({ property1, className }: Props): JSX.Element => {
  return (
    <div className={`activity-proof ${className}`}>
      <div className="rectangle">
        {property1 === "variant-2" && (
          <div className="frame">
            <div className="group">
              <div className="overlap-group">
                <div className="ellipse" />
                <div className="text-wrapper-2">+</div>
              </div>
            </div>
            <div className="text-wrapper-3">증빙 추가하기</div>
          </div>
        )}
      </div>
    </div>
  );
};

ActivityProof.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
};
