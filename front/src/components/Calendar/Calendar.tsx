import React from "react";
import "./Calendar.css";
import { CalendarList } from "components/CalendarList";
import { SubTitle } from "components/SubTitle";
import { CalendarDay } from "components/CalendarDay";

export const Calendar = (): JSX.Element => {
  return (
    <div className="calendar">
      <SubTitle
        className="sub-title-instance"
        divClassName="sub-title-2"
        text="동아리연합회 캘린더"
      />
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
  );
};
