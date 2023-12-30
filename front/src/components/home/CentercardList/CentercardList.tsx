/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import "./style.css";

interface Props {
  title: string;
  subtitle: string;
  url: string;
}

export const CentercardList = ({
  title,
  subtitle,
  url,
}: Props): JSX.Element => {
  const handleClick = () => {
    const currentDomain = window.location.hostname;
    if (url !== "") {
      const linkUrl = new URL(url);
      if (linkUrl.hostname === currentDomain) {
        // 같은 도메인인 경우 현재 탭에서 URL로 이동
        window.location.href = url;
      } else {
        // 다른 도메인인 경우 새 탭에서 URL 열기
        window.open(url, "_blank");
      }
    }
  };

  return (
    <div
      className="centercard-list"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="text-wrapper">{title}</div>
      <div className="div">{subtitle}</div>
    </div>
  );
};
