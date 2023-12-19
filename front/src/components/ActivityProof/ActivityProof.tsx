import React from "react";
import PropTypes from "prop-types";
import "./style.css";

interface Props {
  property1: "variant-2" | "default";
  className: string;
  onUpload?: () => void; // Function to call when file is to be uploaded
  url?: string; // URL of the uploaded file for preview
}

export const ActivityProof = ({
  property1,
  className,
  onUpload,
  url,
}: Props): JSX.Element => {
  const isImage = url?.match(/\.(jpeg|jpg|gif|png)$/) != null;

  return (
    <div className={`activity-proof ${className}`}>
      <div className="rectangle">
        {property1 === "variant-2" ? (
          <div className="frame" onClick={onUpload}>
            <div className="group">
              <div className="overlap-group">
                <div className="ellipse" />
                <div className="text-wrapper-2">+</div>
              </div>
            </div>
            <div className="text-wrapper-3">증빙 추가하기</div>
          </div>
        ) : (
          <div className="proof-content">
            {isImage ? (
              <img src={url} alt="Uploaded Proof" />
            ) : (
              <a href={url} download>
                Download File
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ActivityProof.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
  onUpload: PropTypes.func,
  url: PropTypes.string,
};
