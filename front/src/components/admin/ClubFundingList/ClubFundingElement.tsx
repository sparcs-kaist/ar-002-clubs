/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { ActivityState } from "components/activity/ActivityState";
import "./style.css";
import { getRequest, postRequest } from "utils/api";
import { useNavigate } from "react-router-dom";
import { FundingState } from "components/funding/FundingState";

interface Props {
  type: "zero" | "one" | "two";
  clubId?: number;
  number?: string;
  name?: string;
  approvedAmount?: string;
  expenditureAmount?: string;
  feedbackName?: string;
  executiveId?: number;
  executiveName?: string;
  fundingId?: number;
  feedbackState?: number;
}

interface Executive {
  student_id: number;
  name: string;
}

export const ClubFundingElement = ({
  type,
  clubId = 0,
  fundingId = 0,
  number = "#",
  name = "활동명",
  expenditureAmount = "신청 금액",
  approvedAmount = "승인 금액",
  feedbackName = "검토자",
  executiveName = "담당자",
  executiveId = 0,
  feedbackState = 1,
}: Props): JSX.Element => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState(
    executiveId ? executiveId.toString() : "0"
  );
  const navigate = useNavigate();

  useEffect(() => {
    getRequest(`funding_feedback/club_executive?club_id=${clubId}`, (data) => {
      setExecutives(data);
      if (clubId === 0) {
        setSelectedExecutive("0"); // Default option when no executiveId is provided
      }
    });
  }, [clubId, executiveId]);

  const handleClick = () => {
    navigate(clubId > 0 ? `/admin/funding/${fundingId}` : "");
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = event.target.value;
    const selectedStudentId = event.target.value;
    const selectedExecutive = executives.find(
      (executive) => executive.student_id.toString() === selectedStudentId
    );
    const executiveName = selectedExecutive
      ? selectedExecutive.name
      : "선택안함";

    const confirmation = window.confirm(
      `${name}의 검토 담당자를 ${executiveName}(으)로 변경하시겠습니까?`
    );

    if (confirmation) {
      postRequest(
        "funding_feedback/update_executive",
        { student_id: newValue, funding_id: fundingId },
        (response) => {
          console.log("Post request successful", response.data);
          setSelectedExecutive(newValue);
        },
        (error) => {
          console.error("Post request failed", error);
          alert("검토 담당자 변경에 실패했습니다. 다시 시도해주세요.");
        }
      );
    }
  };

  return (
    <div
      className={`dashboard-activity ${type} design-component-instance-node`}
      style={clubId > 0 ? { cursor: "pointer" } : {}}
    >
      <div className="frame" onClick={handleClick}>
        <div className="element">{type == "two" ? "" : number}</div>
      </div>
      <div className="div-wrapper" onClick={handleClick}>
        <div className="text-wrapper-2">{type == "two" ? "총계" : name}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{expenditureAmount}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{approvedAmount}</div>
      </div>
      <div className="frame-3" onClick={handleClick}>
        <div className="text-wrapper-2">
          {type == "two" ? "" : feedbackName}
        </div>
      </div>
      {type === "zero" ? (
        <div className="frame-3">
          <div className="text-wrapper-2">{executiveName}</div>
        </div>
      ) : type == "two" ? (
        <div className="frame-3">
          <div className="text-wrapper-2">{""}</div>
        </div>
      ) : (
        <select
          value={selectedExecutive}
          onChange={handleSelectChange}
          className={"frame-10 text-wrapper-2"}
        >
          <option key="0" value="0">
            선택안함
          </option>
          {executives.map((executive: any) => (
            <option key={executive.student_id} value={executive.student_id}>
              {executive.name}
            </option>
          ))}
        </select>
      )}
      <div className="frame-4" onClick={handleClick}>
        {type === "zero" && <div className="text-wrapper-2">검토 상태</div>}

        {type === "one" && <FundingState property1={feedbackState} />}
      </div>
    </div>
  );
};
