/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import "./style.css";
import { getRequest, postRequest } from "utils/api";

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
  executive_id?: number;
  text7?: string;
  clubId?: number;
}

interface Executive {
  student_id: number;
  name: string;
}

export const DashboardClubList = ({
  title,
  className,
  text = "#",
  text1 = "동아리명",
  text2 = "검토전",
  text3 = "승인됨",
  text4 = "반려됨",
  text5 = "전체",
  text6 = "지도교수 서명",
  text7 = "담당자",
  executive_id = 0,
  clubId = 0,
}: Props): JSX.Element => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedExecutive, setSelectedExecutive] = useState(
    executive_id ? executive_id.toString() : "0"
  );

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
        "feedback/update_executive",
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

  return (
    <div className={`dashboard-club-list ${title} ${className}`}>
      <div className="frame">
        <div className="element">{text}</div>
      </div>
      <div className="div-wrapper">
        <div className="text-wrapper-2">{text1}</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">{text2}</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">{text3}</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">{text4}</div>
      </div>
      <div className="frame-2">
        <div className="text-wrapper-2">{text5}</div>
      </div>
      <div className="frame-3">
        <div className="text-wrapper-2">{text6}</div>
      </div>
      {title === "zero" ? (
        <div className="frame-2">
          <div className="text-wrapper-2">{text7}</div>
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

DashboardClubList.propTypes = {
  title: PropTypes.oneOf(["zero", "one"]),
  text: PropTypes.string,
  text1: PropTypes.string,
  text2: PropTypes.string,
  text3: PropTypes.string,
  text4: PropTypes.string,
  text5: PropTypes.string,
  text6: PropTypes.string,
  text7: PropTypes.string,
};
