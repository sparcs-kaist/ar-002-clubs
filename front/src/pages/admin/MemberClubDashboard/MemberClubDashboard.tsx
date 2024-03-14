import React, { useEffect, useState } from "react";
import { DashboardClubList } from "components/admin/DashboardClubList";
import { DashboardExecutive } from "components/admin/DashboardExecutive";
import { UnderBar } from "components/home/UnderBar";
import { UpperBar } from "components/home/UpperBar";
import "./MemberClubDashboard.css";
import { SubTitle } from "components/home/SubTitle";
import { getRequest, postRequest } from "utils/api";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";
import { Activity } from "components/activity/Activity";
import { useParams } from "react-router-dom";

interface Registration {
  id: number;
  currentName: string;
  registrationType: string;
  recentEdit: string;
  feedbackType: number;
}

type ApplyInfo = {
  id: number;
  name: string;
  email: string;
  studentId: number;
  startDate: string;
  feedbackType: number;
};

export const MemberClubDashboard = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const [applyLists, setApplyLists] = useState<ApplyInfo[]>([]);
  const { id } = useParams();

  // API로부터 데이터를 불러오는 함수
  useEffect(() => {
    const fetchApplies = async () => {
      await getRequest(
        `member/list?club_id=${id}`,
        (data) => {
          const formattedData = data.data.map(
            (item: {
              student_id: any;
              memberEmail: any;
              memberName: any;
              apply_time_formatted: any;
              approved_type: any;
            }) => ({
              studentId: item.student_id,
              email: item.memberEmail,
              name: item.memberName,
              startDate: item.apply_time_formatted,
              feedbackType: item.approved_type,
            })
          );

          setApplyLists(formattedData);
        },
        (error) => {
          console.error("Error fetching applies:", error);
        }
      );
    };

    fetchApplies();
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
                        property1="variant-2"
                        isRegistration={5}
                        activityStateProperty1={2}
                        id={0}
                      />
                      {applyLists.map((member, index) => (
                        <Activity
                          key={index}
                          index={index + 1}
                          name={`${member.studentId} ${member.name}`}
                          type={member.email}
                          start_date={member.startDate}
                          activityStateProperty1={member.feedbackType}
                          isRegistration={5}
                          handleRegistration={() => {
                            if (member.feedbackType === 2) {
                              const isConfirmed = window.confirm(
                                `${member.name}의 가입을 반려로 정정하시겠습니까?`
                              );

                              if (isConfirmed) {
                                postRequest(
                                  `member/disapprove?student_id=${member.studentId}&club_id=${id}`,
                                  {},
                                  () => {
                                    // Update feedbackType to approved
                                    const updatedApplies = applyLists.map(
                                      (appl) =>
                                        appl.studentId === member.studentId
                                          ? { ...appl, feedbackType: 3 } // Assuming feedbackType 2 means approved
                                          : appl
                                    );
                                    setApplyLists(updatedApplies); // Corrected here
                                    alert(
                                      `${member.name}의 가입이 반려되었습니다.`
                                    );
                                  }
                                );
                              }
                            } else if (member.feedbackType === 3) {
                              const isConfirmed = window.confirm(
                                `${member.name}의 가입을 승인으로 정정하시겠습니까?`
                              );

                              if (isConfirmed) {
                                postRequest(
                                  `member/approve?student_id=${member.studentId}&club_id=${id}`,
                                  {},
                                  () => {
                                    // Update feedbackType to approved
                                    const updatedApplies = applyLists.map(
                                      (appl) =>
                                        appl.studentId === member.studentId
                                          ? { ...appl, feedbackType: 2 } // Assuming feedbackType 2 means approved
                                          : appl
                                    );
                                    setApplyLists(updatedApplies); // Corrected here
                                    alert(
                                      `${member.name}의 가입이 승인되었습니다.`
                                    );
                                  }
                                );
                              }
                            }
                          }}
                          id={member.studentId}
                        />
                      ))}
                    </div>
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
