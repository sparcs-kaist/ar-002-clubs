import React from "react";
import "./Button.css";

interface Props {
  title: string;
  clickHandler: () => void;
}

export const Button = ({ title, clickHandler }: Props): JSX.Element => {
  return (
    <button
      className="button"
      onClick={clickHandler}
      style={{ cursor: "pointer" }}
    >
      <div className="text-wrapper">{title}</div>
    </button>
  );
};
