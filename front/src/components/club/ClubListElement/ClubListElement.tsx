/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import Members from "assets/Images/members.png";

interface Props {
  id: number;
  name: string;
  character: string;
  type: string;
  president: string;
  advisor: string;
  totalNumbers: number;
  isRegistration?: boolean;
  registrationState?: number;
  onRegistrationClick?: () => void;
}

export const ClubListElement = ({
  id,
  name,
  character,
  type,
  president,
  advisor,
  totalNumbers,
  isRegistration = false,
  registrationState = 0,
  onRegistrationClick = () => {},
}: Props): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div className="club-list-element">
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate(`/club_detail/${id}`);
        }}
      >
        <p className="p">
          <span className="span">{type}</span>
          <span className="text-wrapper-3">
            {" "}
            {president ? `| 회장 ${president}` : ""}{" "}
            {advisor ? `| 지도교수 ${advisor}` : ""}
          </span>
        </p>
        <div className="frame">
          <div className="MUSE">{name}</div>
          <div className="text-wrapper-4">{character}</div>
        </div>
        <div className="frame-2">
          <img className="img" alt="Image" src={Members} />
          <div className="text-wrapper-5">{totalNumbers}</div>
        </div>
      </div>
      {isRegistration && (
        <div
          className="register-button"
          style={{ cursor: "pointer" }}
          onClick={onRegistrationClick}
        >
          {registrationState === 0
            ? "등록 신청"
            : registrationState === 1
            ? "승인 대기"
            : registrationState === 2
            ? "승인 완료"
            : "승인 반려"}
        </div>
      )}
    </div>
  );
};
