/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { ActivityState } from "components/activity/ActivityState";
import "./style.css";

interface Props {
  title: "zero" | "one";
  className: any;
  activityStateProperty1: "variant-2" | "variant-3" | "default";
}

export const DashboardActivity = ({
  title,
  className,
  activityStateProperty1 = "variant-2",
}: Props): JSX.Element => {
  return (
    <div className={`dashboard-activity ${title} ${className}`}>
      <div className="frame">
        <div className="element">#</div>
      </div>
      <div className="div-wrapper">
        <div className="text-wrapper-2">활동명</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">최근 제출 시각</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">최근 검토 시각</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">검토자</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">담당자</div>
      </div>
      <div className="frame-4">
        {title === "zero" && <div className="text-wrapper-2">검토 상태</div>}

        {title === "one" && (
          <ActivityState property1={activityStateProperty1} />
        )}
      </div>
    </div>
  );
};

DashboardActivity.propTypes = {
  title: PropTypes.oneOf(["zero", "one"]),
  activityStateProperty1: PropTypes.string,
};
