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

interface Props {
  type: "zero" | "one";
  clubId?: number;
  number?: string;
  title?: string;
  editedTime?: string;
  feedbackTime?: string;
  feedbackName?: string;
  executiveId?: number;
  executiveName?: string;
  activityId?: number;
  feedbackState?: number;
}

interface Executive {
  student_id: number;
  name: string;
}

export const DashboardActivity = ({
  type,
  clubId = 0,
  activityId = 0,
  number = "#",
  title = "활동명",
  editedTime = "최근 제출 시각",
  feedbackTime = "최근 검토 시각",
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
    getRequest(`feedback/club_executive?club_id=${clubId}`, (data) => {
      setExecutives(data);
      if (clubId === 0) {
        setSelectedExecutive("0"); // Default option when no executiveId is provided
      }
    });
  }, [clubId, executiveId]);

  const handleClick = () => {
    navigate(clubId > 0 ? `/admin/activity/${activityId}` : "");
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
      `${title}의 검토 담당자를 ${executiveName}(으)로 변경하시겠습니까?`
    );

    if (confirmation) {
      postRequest(
        "feedback/update_executive",
        { student_id: newValue, activity_id: activityId },
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
        <div className="element">{number}</div>
      </div>
      <div className="div-wrapper" onClick={handleClick}>
        <div className="text-wrapper-2">{title}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{editedTime}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{feedbackTime}</div>
      </div>
      <div className="frame-3" onClick={handleClick}>
        <div className="text-wrapper-2">{feedbackName}</div>
      </div>
      {type === "zero" ? (
        <div className="frame-3">
          <div className="text-wrapper-2">{executiveName}</div>
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

        {type === "one" && (
          <ActivityState
            property1={
              feedbackState === 2
                ? "variant-2"
                : feedbackState === 3
                ? "variant-3"
                : "default"
            }
          />
        )}
      </div>
    </div>
  );
};

DashboardActivity.propTypes = {
  type: PropTypes.oneOf(["zero", "one"]),
  activityStateProperty1: PropTypes.string,
};
