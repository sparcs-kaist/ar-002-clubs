/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { ActivityState } from "../ActivityState";
import "./style.css";
import { useNavigate } from "react-router-dom";

interface Props {
  id: number;
  property1?: "variant-2" | "default";
  className?: string;
  activityStateProperty1: number;
  index?: number;
  name?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}

export const Activity = ({
  property1 = "default",
  className = "activity-instance",
  activityStateProperty1 = 1,
  index = 0,
  name = "",
  type = "",
  start_date = "",
  end_date = "",
  id = 0,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div className={`activity ${property1} ${className}`}>
      <div
        className="frame-31"
        onClick={() => {
          {
            property1 === "default" && navigate(`/activity_detail/${id}`);
          }
        }}
        style={property1 === "default" ? { cursor: "pointer" } : {}}
      >
        {property1 === "default" && (
          <>
            <div className="frame">
              <div className="text-wrapper-2">{index}</div>
            </div>
            <div className="div-wrapper">
              <p className="text-wrapper-3">{name}</p>
            </div>
            <div className="frame-2">
              <p className="text-wrapper-3">{type}</p>
            </div>
            <div className="frame-3">
              <div className="text-wrapper-3">
                {start_date}~{end_date}
              </div>
            </div>
            <div className="activity-state-wrapper">
              <ActivityState
                property1={
                  activityStateProperty1 === 1
                    ? "default"
                    : activityStateProperty1 === 2
                    ? "variant-2"
                    : "variant-3"
                }
              />
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
