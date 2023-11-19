/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";
import Members from "assets/Images/members.png";

interface Props {
  id: number;
  name: string;
  character : string;
  type: string;
  president : string;
  advisor : string;
  totalNumbers : number;
}

export const ClubListElement = ({ id, name, character, type, president, advisor, totalNumbers }: Props): JSX.Element => {
  return (
    <div className="club-list-element" style= {{cursor: "pointer"}} onClick={() => {
      window.location.href = `${process.env.REACT_APP_FRONTEND_URL}/club_detail/${id}`;
    }}>
      <p className="p">
        <span className="span">{type}</span>
        <span className="text-wrapper-3"> {president? `| 회장 ${president}`:""} {advisor? `| 지도교수 ${advisor}`:""}</span>
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
  );
};
