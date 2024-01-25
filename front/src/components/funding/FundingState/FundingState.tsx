/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  property1: number;
}

export const FundingState = ({ property1 }: Props): JSX.Element => {
  return (
    <div className={`activity-state property-1-0-${property1}`}>
      <div className="div-2">
        {property1 === 1 && <>검토전</>}

        {property1 === 2 && <>전체승인</>}

        {property1 === 3 && <>부분승인</>}

        {property1 === 4 && <>미승인</>}
      </div>
    </div>
  );
};
