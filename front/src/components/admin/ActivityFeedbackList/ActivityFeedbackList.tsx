/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { ActivityState } from "../../activity/ActivityState";
import "./ActivityFeedbackList.css";
import { useNavigate } from "react-router-dom";

interface Props {
  title: "zero" | "one";
  activity_id?: number;
  index?: string;
  club?: string;
  activity?: string;
  doneby?: string;
  chargeof?: string;
  state?: number;
}

export const ActivityFeedbackList = ({
  activity_id = 0,
  title = "zero",
  index = "#",
  club = "동아리명",
  activity = "활동명",
  doneby = "검토자",
  chargeof = "담당자",
  state = 1,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div
      className={`activity-feedback ${title} "design-component-instance-node"`}
      onClick={() =>
        title === "one" && navigate(`/activity_detail/${activity_id}`)
      }
      style={{ cursor: "pointer" }}
    >
      <div className="frame">
        <div className="element">{index}</div>
      </div>
      <div className="div-wrapper">
        <div className="text-wrapper-2">{club}</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">{activity}</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">{doneby}</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">{chargeof}</div>
      </div>
      <div className="frame-4">
        {title === "zero" && <div className="text-wrapper-2">검토 상태</div>}

        {title === "one" && (
          <ActivityState
            property1={
              state === 2 ? "variant-2" : state === 3 ? "variant-3" : "default"
            }
          />
        )}
      </div>
    </div>
  );
};

ActivityFeedbackList.propTypes = {
  title: PropTypes.oneOf(["zero", "one"]),
};
