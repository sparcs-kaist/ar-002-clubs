/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import DropUp from "assets/Images/dropup.png";
import DropDown from "assets/Images/dropdown.png";
import "./style.css";

interface Props {
  title: string;
  prop: number;
  id: number;
  onClick : () => void;
}

export const ClubListTitle = ({ title,prop,id,onClick }: Props): JSX.Element => {
  return (
    <div className="club-list-title" onClick={onClick}>
      <div className="text-wrapper-2">{title}</div>
      <img className="image" src={prop === 0 ? DropUp : DropDown} />
    </div>
  );
};

ClubListTitle.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
};
