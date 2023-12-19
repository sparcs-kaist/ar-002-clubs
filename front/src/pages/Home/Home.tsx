import React, { useEffect, useState } from "react";
import { CalendarDay } from "components/CalendarDay";
import { CalendarList } from "components/CalendarList";
import { CenterCard } from "components/CenterCard";
import { CenterMenu } from "components/CenterMenu";
import { SubTitle } from "components/SubTitle";
import { UpperBar } from "components/UpperBar";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "contexts/authContext";
import "./Home.css";
import { UnderBar } from "components/UnderBar";
import { getRequest, postRequest } from "utils/api";
import { Calendar } from "components/Calendar";

export const Home = (): JSX.Element => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const userInfoStr = queryParams.get("userInfo");

      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        const DEVUID = process.env.REACT_APP_DEVUID;

        if (userInfo.kaist_info) {
          userInfo.kaist_info = JSON.parse(userInfo.kaist_info);
        }

        if (userInfo.uid === DEVUID) {
          userInfo.kaist_info = {
            kaist_uid: process.env.REACT_APP_kaist_uid,
            mail: process.env.REACT_APP_mail,
            ku_sex: process.env.REACT_APP_ku_sex,
            ku_acad_prog_code: process.env.REACT_APP_ku_acad_prog_code,
            ku_kaist_org_id: process.env.REACT_APP_ku_kaist_org_id,
            ku_kname: process.env.REACT_APP_ku_kname,
            ku_person_type: process.env.REACT_APP_ku_person_type,
            ku_person_type_kor: process.env.REACT_APP_ku_person_type_kor,
            ku_psft_user_status_kor:
              process.env.REACT_APP_ku_psft_user_status_kor,
            ku_born_date: process.env.REACT_APP_ku_born_date,
            ku_std_no: process.env.REACT_APP_ku_std_no,
            ku_psft_user_status: process.env.REACT_APP_ku_psft_user_status,
            employeeType: process.env.REACT_APP_employeeType,
            givenname: process.env.REACT_APP_givenname,
            displayname: process.env.REACT_APP_displayname,
            sn: process.env.REACT_APP_sn,
          };
        }
        console.log(userInfo);

        try {
          await postRequest("user/", userInfo, () => {});
          await getRequest("user", (data) => {
            login(data);
            console.log(data);
          });
          navigate("/");
        } catch (error) {
          console.error(error);
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
