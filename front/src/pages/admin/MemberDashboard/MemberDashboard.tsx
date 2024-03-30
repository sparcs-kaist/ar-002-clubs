import React, { useEffect, useState } from "react";
import { DashboardClubList } from "components/admin/DashboardClubList";
import { DashboardExecutive } from "components/admin/DashboardExecutive";
import { UnderBar } from "components/home/UnderBar";
import { UpperBar } from "components/home/UpperBar";
import "./MemberDashboard.css";
import { SubTitle } from "components/home/SubTitle";
import { getRequest } from "utils/api";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";
import { Activity } from "components/activity/Activity";

interface Club {
  id: number;
  name: string;
  clubType: string;
  members: number;
  approvedMembers: number;
  approvedRegularMembers: number;
}

export const MemberDashboard = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const [clubs, setClubs] = useState<Club[]>([]);

  // API로부터 데이터를 불러오는 함수
  useEffect(() => {
    const fetchRegistrations = async () => {
      await getRequest(
        `member/clubs`,
        (data) => {
          const clubsData: Club[] = data.data.map((clubInfo: any) => ({
            id: clubInfo.club_id,
            name: clubInfo.name,
            clubType: clubInfo.type, // 가정: clubInfo.type이 객체이고 그 안에 type 문자열이 있다고 가정합니다.
            members: clubInfo.count, // 가정: 받아온 데이터에 count와 totalApproved가 직접 포함되어 있다고 가정합니다.
            approvedMembers: clubInfo.countApproved,
            approvedRegularMembers: clubInfo.countApprovedRegular,
          }));

          setClubs(clubsData);
        },
        (error) => {
          console.error("Error fetching clubs:", error);
        }
      );
    };

    fetchRegistrations();
  }, []);

  return (
    <div className="activity-dashboard">
      <div className="frame-7">
        <UpperBar className={"UpperBar"} title={"회원 신청 대시보드"} />
        <div className="frame-wrapper">
          <div className="frame-11">
            <div className="frame-12">
              <div className="frame-13">
                <div className="frame-14">
                  <SubTitle
                    className="sub-title-instance"
                    text="회원 신청 현황"
                  />
                  <div className="frame-15">
                    <div>
                      <Activity
                        property1="variant-3"
                        activityStateProperty1={2}
                        isRegistration={6}
                        id={0}
                      />
                      {Array.isArray(clubs) &&
                        clubs.map((club, index) => (
                          <Activity
                            isRegistration={6}
                            key={index}
                            index={index + 1}
                            name={club.name}
                            type={club.clubType}
                            start_date={`${club.approvedRegularMembers}명 /${club.approvedMembers}명 / ${club.members}명`}
                            activityStateProperty1={1}
                            id={club.id}
                          />
                        ))}
                    </div>
                  </div>
                  {/* <div className="frame-15">
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
                    </div> */}
                  {/* <div className="group-5">
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
                  </div> */}
                </div>
                {/* <div className="frame-14">
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
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
