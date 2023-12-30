/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  property1: "variant-4" | "variant-2" | "variant-3" | "variant-1" | "default";
  className: any;
  overlapGroupClassName?: any;
  divClassName?: any;
  text?: string;
  dropdownOptions?: string[];
  dropdownValue?: string;
  onDropdownChange?: (e: any) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TableEntry = ({
  property1,
  className,
  overlapGroupClassName,
  divClassName,
  text = "출결대상",
  dropdownOptions = [],
  dropdownValue = "",
  onDropdownChange,
  onChange,
}: Props): JSX.Element => {
  return (
    <div className={`table-entry ${property1} ${className}`}>
      <div className={`overlap-group ${overlapGroupClassName}`}>
        {["default", "variant-4"].includes(property1) && (
          <div className={`text-wrapper-3 ${divClassName}`}>{text}</div>
        )}
        {property1 === "variant-1" && (
          <input
            className={`text-wrapper-3 ${divClassName}`}
            defaultValue={text}
            style={{ border: "none", background: "transparent" }}
            onChange={onChange}
          />
        )}
        {/* {["variant-2", "variant-3"].includes(property1) && (
          <>
            <div className="text-wrapper-4">{text}</div>
            <img
              className="image"
              alt="Image"
              src={
                property1 === "variant-3"
                  ? "/img/image-9-7.png"
                  : "/img/image-9-8.png"
              }
            />
          </>
        )} */}
        {property1 === "variant-2" && (
          <select
            className={`text-wrapper-3 ${divClassName}`}
            value={dropdownValue}
            onChange={onDropdownChange}
            style={{ border: "none", background: "transparent" }}
          >
            {dropdownOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};
