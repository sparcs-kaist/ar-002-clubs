import React, { useEffect }  from "react";
import { CalendarDay } from "components/CalendarDay";
import { CalendarList } from "components/CalendarList";
import { CenterCard } from "components/CenterCard";
import { CenterMenu } from "components/CenterMenu";
import { SubTitle } from "components/SubTitle";
import { UpperBar } from "components/UpperBar";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/authContext';
import "./Home.css";
import { UnderBar } from "components/UnderBar";

export const Home = (): JSX.Element => {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userInfoStr = queryParams.get('userInfo');
    
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      login(userInfo);
      console.log(userInfo);
      navigate('/');
    }
    
  }, [location, login]);

  return (
    <div className="home">
      <div className="div-2">
        <UpperBar className="upper-bar-instance" />
        <UnderBar/>
        <div className="frame-8">
          <CenterCard SubTitleText="카페 공지사항"/>
          <CenterCard SubTitleText="최근 진행한 회의"/>
          <CenterCard SubTitleText="나의 동아리"/>
        </div>
        <SubTitle className="sub-title-3" divClassName="design-component-instance-node" text="서비스 신청" />
        <div className="frame-9">
          <CenterMenu divClassName="center-menu-instance" text="활동확인서 발급" />
          <CenterMenu divClassName="center-menu-instance" text="홍보물 인쇄" />
          <CenterMenu divClassName="center-menu-2" text="이젤 대여" />
          <CenterMenu divClassName="center-menu-instance" text="청소기 대여" />
          <CenterMenu divClassName="center-menu-2" text="창고 사용" />
          <CenterMenu divClassName="center-menu-3" text="공용공간 임시사용" />
        </div>
        <SubTitle className="sub-title-instance" divClassName="sub-title-2" text="동아리연합회 캘린더" />
        <div className="frame-5">
          <div className="frame-6">
            <div className="text-wrapper-16">&lt;</div>
            <div className="text-wrapper-16">2023년 9월 30일</div>
            <div className="text-wrapper-16">&gt;</div>
          </div>
          <div className="frame-7">
            <CalendarList />
            <CalendarList />
            <CalendarList />
            <CalendarList />
            <CalendarList />
            <CalendarList />
            <CalendarList />
          </div>
        </div>
        <div className="frame-10">
          <div className="frame-11">
            <div className="text-wrapper-17">&lt;</div>
            <div className="text-wrapper-18">2023년 10월</div>
            <div className="text-wrapper-17">&gt;</div>
          </div>
          <div className="frame-12">
            <div className="text-wrapper-19">일</div>
            <div className="text-wrapper-19">월</div>
            <div className="text-wrapper-19">화</div>
            <div className="text-wrapper-19">수</div>
            <div className="text-wrapper-19">목</div>
            <div className="text-wrapper-19">금</div>
            <div className="text-wrapper-19">토</div>
          </div>
          <div className="frame-13">
            <div className="frame-14">
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
            </div>
            <div className="frame-14">
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
            </div>
            <div className="frame-14">
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
            </div>
            <div className="frame-14">
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
            </div>
            <div className="frame-14">
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
              <CalendarDay className="calendar-day-instance" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
