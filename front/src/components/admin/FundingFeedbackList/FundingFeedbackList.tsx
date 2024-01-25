/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import "./FundingFeedbackList.css";
import { useNavigate } from "react-router-dom";
import { FundingState } from "components/funding/FundingState";

interface Props {
  title: "zero" | "one";
  activity_id?: number;
  index?: string;
  club?: string;
  activity?: string;
  doneby?: string;
  expenditureAmount?: string;
  approvedAmount?: string;
  state?: number;
}

export const FundingFeedbackList = ({
  activity_id = 0,
  title = "zero",
  index = "#",
  club = "동아리명",
  activity = "항목명",
  expenditureAmount = "신청금액",
  approvedAmount = "승인금액",
  doneby = "검토자",
  state = 1,
}: Props): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div
      className={`funding-feedback-list ${title} "design-component-instance-node"`}
      onClick={() =>
        title === "one" && navigate(`/admin/funding/${activity_id}`)
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
      <div className="frame-4">
        <div className="text-wrapper-2">{expenditureAmount}</div>
      </div>
      <div className="frame-4">
        <div className="text-wrapper-2">{approvedAmount}</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">{doneby}</div>
      </div>
      <div className="frame-4">
        {title === "zero" && <div className="text-wrapper-2">검토 상태</div>}

        {title === "one" && <FundingState property1={state} />}
      </div>
    </div>
  );
};
