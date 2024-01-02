import React, { useEffect, useState } from "react";
import { DashboardClubList } from "components/admin/DashboardClubList";
import { DashboardExecutive } from "components/admin/DashboardExecutive";
import { UnderBar } from "components/home/UnderBar";
import { UpperBar } from "components/home/UpperBar";
import "./ActivityDashboard.css";
import { SubTitle } from "components/home/SubTitle";
import { getRequest } from "utils/api";

interface ClubData {
  clubName: string;
  feedbackTypeOne: number;
  feedbackTypeTwo: number;
  feedbackTypeThree: number;
  totalClubActivities: number;
  advisorStatus: string;
  executive_id: number;
  executive: string;
  clubId: number;
}

interface DashboardData {
  totalActivities: number;
  nonFeedbackTypeOneActivities: number;
  ratio: number;
  clubData: ClubData[];
}

export const ActivityDashboard = (): JSX.Element => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalActivities: 0,
    nonFeedbackTypeOneActivities: 0,
    ratio: 0.0,
    clubData: [],
  });

  // API로부터 데이터를 불러오는 함수
  useEffect(() => {
    const fetchDashboardData = async () => {
      getRequest(
        "feedback/activity_submit_list",
        (data) => {
          console.log(data);
          setDashboardData(data);
        },
        (error) => console.error("Failed to fetch dashboard data:", error)
      );
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="activity-dashboard">
      <div className="frame-7">
        <UpperBar className={"UpperBar"} title={"활동보고서 제출 현황"} />
        <div className="frame-wrapper">
          <div className="frame-11">
            <div className="frame-12">
              <div className="frame-13">
                <div className="frame-14">
                  <SubTitle
                    className="sub-title-instance"
                    text="활동 보고서 제출 현황"
                  />
                  <div className="frame-15">
                    <div className="group-3">
                      <p className="p">
                        <span className="span">전체 활동수 :</span>
                        <span className="text-wrapper-8">
                          {" "}
                          {dashboardData.totalActivities}개
                        </span>
                      </p>
                    </div>
                    <div className="group-4">
                      <p className="element-3">
                        <span className="span">검토 활동수 :</span>
                        <span className="text-wrapper-8">
                          {" "}
                          {dashboardData.nonFeedbackTypeOneActivities}개
                        </span>
                      </p>
                    </div>
                    <div className="group-5">
                      <p className="element-4">
                        <span className="span">검토율 :</span>
                        <span className="text-wrapper-8">
                          {" "}
                          {dashboardData.ratio.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="frame-16">
                    <DashboardClubList
                      className="design-component-instance-node"
                      title="zero"
                    />
                    {Array.isArray(dashboardData.clubData) &&
                      dashboardData.clubData.map((club: any, index: any) => (
                        <DashboardClubList
                          key={index}
                          className="design-component-instance-node"
                          clubId={club.clubId}
                          text={String(index + 1)}
                          text1={club.clubName}
                          text2={String(club.feedbackTypeOne)}
                          text3={String(club.feedbackTypeTwo)}
                          text4={String(club.feedbackTypeThree)}
                          text5={String(club.totalClubActivities)}
                          text6={club.advisorStatus}
                          executive_id={club.executive_id}
                          text7={club.executive}
                          title="one"
                        />
                      ))}
                  </div>
                </div>
                <div className="frame-14">
                  <SubTitle
                    className="sub-title-instance"
                    text="활동 보고서 검토 현황"
                  />
                  <div className="frame-16">
                    <DashboardExecutive
                      className="design-component-instance-node"
                      title="zero"
                      text="1"
                      text1="박병찬"
                      text2="10"
                      text3="2"
                      text4="1"
                      text5="3"
                      text6="10"
                      text7="30.00%"
                    />
                    <DashboardExecutive
                      className="design-component-instance-node"
                      text="1"
                      text1="박병찬"
                      text2="10"
                      text3="2"
                      text4="1"
                      text5="3"
                      text6="10"
                      text7="30.00%"
                      title="one"
                    />
                    <DashboardExecutive
                      className="design-component-instance-node"
                      text="2"
                      text1="이동건"
                      text2="9"
                      text3="1"
                      text4="3"
                      text5="4"
                      text6="10"
                      text7="12.34%"
                      title="one"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
