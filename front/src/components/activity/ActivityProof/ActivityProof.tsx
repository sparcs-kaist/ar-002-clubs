import React from "react";
import PropTypes from "prop-types";
import "./style.css";

interface Props {
  property1: "variant-2" | "default";
  className: string;
  onUpload?: () => void;
  url?: string;
  fileName?: string;
  onDelete?: (fileName: string) => void; // Function to call when file is to be deleted
}

export const ActivityProof = ({
  property1,
  className,
  onUpload,
  url,
  fileName,
  onDelete,
}: Props): JSX.Element => {
  const isImage = url?.match(/\.(jpeg|jpg|gif|png)$/) != null;
  const proxyUrl = url
    ? `${process.env.REACT_APP_BACKEND_URL}/activity/image-proxy?url=${url}`
    : "";

  const handleDelete = () => {
    if (onDelete && fileName) {
      onDelete(fileName);
    }
  };

  return (
    <div className={`activity-proof ${className}`}>
      <div className="rectangle">
        {property1 !== "variant-2" ? (
          <button
            onClick={handleDelete}
            className="delete-button"
            style={{ zIndex: 100 }}
          >
            X
          </button>
        ) : (
          <></>
        )}

        <div className="proof-content">
          {isImage ? (
            <img
              style={{
                width: "493px",
                height: "493px",
                objectFit: "contain",
              }}
              src={proxyUrl}
              alt={fileName || "Uploaded Proof"} // Use file name as alt text
            />
          ) : (
            <a href={proxyUrl} download={fileName}>
              {fileName}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

ActivityProof.propTypes = {
  property1: PropTypes.oneOf(["variant-2", "default"]),
  onUpload: PropTypes.func,
  url: PropTypes.string,
};
