import React, { useEffect, useState } from "react";
import { CalendarDay } from "components/home/CalendarDay";
import { CalendarList } from "components/home/CalendarList";
import { CenterCard } from "components/home/CenterCard";
import { CenterMenu } from "components/home/CenterMenu";
import { SubTitle } from "components/home/SubTitle";
import { UpperBar } from "components/home/UpperBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "contexts/authContext";
import "./Admin.css";
import { UnderBar } from "components/home/UnderBar";
import { getRequest, postRequest } from "utils/api";
import { useExecutiveStatus } from "hooks/useUserPermission";

export const Admin = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  return (
    <div className="admin">
      <div className="div-2">
        <UpperBar
          className="upper-bar-instance"
          title={"동아리연합회 집행부"}
        />
        <UnderBar />
        <div className="frame-8">
          <CenterCard SubTitleText="회장단" />
          <CenterCard SubTitleText="사무국" />
          <CenterCard SubTitleText="관리국" />
        </div>
        <div className="frame-9">
          <CenterCard SubTitleText="기획국" />
          <CenterCard SubTitleText="복지소통국" />
          <CenterCard SubTitleText="정보국" />
        </div>
        {/* <Calendar /> */}
      </div>
    </div>
  );
};
