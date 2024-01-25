/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import "./style.css";
import { getRequest, postRequest } from "utils/api";
import { useNavigate } from "react-router-dom";

interface Props {
  title: "zero" | "one";
  className: any;
  text?: string;
  text1?: string;
  text2?: string;
  text3?: string;
  text4?: string;
  text5?: string;
  text6?: string;
  text7?: string;
  text8?: string;
  text9?: string;
  executive_id?: number;
  clubId?: number;
}

interface Executive {
  student_id: number;
  name: string;
}

export const DashboardFundingList = ({
  title,
  className,
  text = "#",
  text1 = "동아리명",
  text2 = "검토전",
  text3 = "전체승인",
  text4 = "부분승인",
  text5 = "미승인",
  text6 = "전체",
  text7 = "신청금액",
  text8 = "승인금액",
  text9 = "담당자",
  executive_id = 0,
  clubId = 0,
}: Props): JSX.Element => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState(
    executive_id ? executive_id.toString() : "0"
  );
  const navigate = useNavigate();

  useEffect(() => {
    getRequest(`feedback/club_executive?club_id=${clubId}`, (data) => {
      setExecutives(data);
      if (executive_id === 0) {
        setSelectedExecutive("0"); // Default option when no executive_id is provided
      }
    });
  }, [clubId, executive_id]);

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
      `${text1}의 검토 담당자를 ${executiveName}(으)로 모두 변경하시겠습니까?`
    );

    if (confirmation) {
      // Call POST API here
      postRequest(
        "funding_feedback/update_executive",
        { student_id: newValue, club_id: clubId },
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

  const handleClick = () => {
    // navigate(clubId > 0 ? `/admin/club_activity/${clubId}` : "");
  };

  return (
    <div
      className={`dashboard-funding-list ${title} ${className}`}
      style={clubId > 0 ? { cursor: "pointer" } : {}}
    >
      <div className="frame" onClick={handleClick}>
        <div className="element">{text}</div>
      </div>
      <div className="div-wrapper" onClick={handleClick}>
        <div className="text-wrapper-2">{text1}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{text2}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{text3}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{text4}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{text5}</div>
      </div>
      <div className="frame-2" onClick={handleClick}>
        <div className="text-wrapper-2">{text6}</div>
      </div>
      <div className="frame-3" onClick={handleClick}>
        <div className="text-wrapper-2">{text7}</div>
      </div>
      <div className="frame-3" onClick={handleClick}>
        <div className="text-wrapper-2">{text8}</div>
      </div>
      {title === "zero" ? (
        <div className="frame-2">
          <div className="text-wrapper-2">{text9}</div>
        </div>
      ) : (
        <select
          value={selectedExecutive}
          onChange={handleSelectChange}
          className={"frame-2 text-wrapper-2"}
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
    </div>
  );
};
