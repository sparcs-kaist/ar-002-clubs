import React, { useEffect, useState } from "react";
import { CalendarDay } from "components/home/CalendarDay";
import { CalendarList } from "components/home/CalendarList";
import { CenterCard } from "components/home/CenterCard";
import { CenterMenu } from "components/home/CenterMenu";
import { SubTitle } from "components/home/SubTitle";
import { UpperBar } from "components/home/UpperBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "contexts/authContext";
import "./Home.css";
import { UnderBar } from "components/home/UnderBar";
import { getRequest, postRequest } from "utils/api";
import { Calendar } from "components/home/Calendar";

export const Home = (): JSX.Element => {
  const { login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const loginInfoStr = queryParams.get("loginInfo");

      if (loginInfoStr) {
        const loginInfo = JSON.parse(loginInfoStr);

        try {
          console.log(loginInfo);
          await postRequest("user", loginInfo, () => {});
          await getRequest("user", (data) => {
            login(data);
          });
          navigate("/");
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    };

    fetchData();
  }, [location, login, navigate]);

  return (
    <div className="home">
      <div className="div-2">
        <UpperBar className="upper-bar-instance" />
        <UnderBar />
        <div className="frame-8">
          <CenterCard SubTitleText="카페 공지사항" />
          <CenterCard SubTitleText="최근 진행한 회의" />
          <CenterCard SubTitleText="나의 동아리" />
        </div>
        <SubTitle
          className="sub-title-3"
          divClassName="design-component-instance-node"
          text="서비스 신청"
        />
        <div className="frame-9">
          <CenterMenu
            divClassName="center-menu-instance"
            text="활동확인서 발급"
          />
          <CenterMenu divClassName="center-menu-instance" text="홍보물 인쇄" />
          <CenterMenu divClassName="center-menu-2" text="이젤 대여" />
          <CenterMenu divClassName="center-menu-instance" text="청소기 대여" />
          <CenterMenu divClassName="center-menu-2" text="창고 사용" />
          <CenterMenu divClassName="center-menu-3" text="공용공간 임시사용" />
        </div>
        {/* <Calendar /> */}
      </div>
    </div>
  );
};
