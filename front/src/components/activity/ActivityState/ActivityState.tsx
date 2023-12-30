/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import "./style.css";

interface Props {
  property1: "variant-2" | "variant-3" | "default";
}

export const ActivityState = ({ property1 }: Props): JSX.Element => {
  return (
    <div className={`activity-state property-1-0-${property1}`}>
      <div className="div-2">
        {property1 === "default" && <>검토전</>}

        {property1 === "variant-2" && <>승인됨</>}

        {property1 === "variant-3" && <>반려됨</>}
      </div>
    </div>
  );
};

ActivityState.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "variant-3", "default"]),
};
