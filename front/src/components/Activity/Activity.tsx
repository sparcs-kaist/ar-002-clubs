/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { ActivityState } from "../ActivityState";
import "./style.css";

interface Props {
  property1: "variant-2" | "default";
  className: any;
  activityStateProperty1: "variant-2" | "variant-3" | "default";
}

export const Activity = ({
  property1,
  className,
  activityStateProperty1 = "default",
}: Props): JSX.Element => {
  return (
    <div className={`activity ${property1} ${className}`}>
      <div className="frame-31">
        {property1 === "default" && (
          <>
            <div className="frame">
              <div className="text-wrapper-2">11</div>
            </div>
            <div className="div-wrapper">
              <p className="text-wrapper-3">석림태울제 부스 홍보 및 준비</p>
            </div>
            <div className="frame-2">
              <p className="text-wrapper-3">동아리 성격에 합치하지 않는 활동</p>
            </div>
            <div className="frame-3">
              <div className="text-wrapper-3">2023.10.26.-2023.10.27.</div>
            </div>
            <div className="activity-state-wrapper">
              <ActivityState property1={activityStateProperty1} />
            </div>
          </>
        )}

        {property1 === "variant-2" && (
          <div className="frame-4">
            <div className="frame-5">
              <div className="text-wrapper-2">#</div>
            </div>
            <div className="div-wrapper">
              <p className="text-wrapper-3">활동명</p>
            </div>
            <div className="frame-2">
              <p className="text-wrapper-3">활동 분류</p>
            </div>
            <div className="frame-3">
              <div className="text-wrapper-3">활동 기간</div>
            </div>
            <div className="frame-6">
              <div className="text-wrapper-3">검토 상태</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Activity.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
  activityStateProperty1: PropTypes.string,
};
