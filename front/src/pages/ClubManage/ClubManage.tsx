import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRepresentativeStatus } from "hooks/useUserRepresentativeStatus";
import { Activity } from "components/Activity";
import { ActivityState } from "components/ActivityState";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import { UpperBar } from "components/UpperBar";
import "./ClubManage.css";
import { getRequest } from "utils/api";
import { useReportDurationStatus } from "hooks/useReportDurationStatus";

type Representative = {
  student_id: number;
  name: string;
};

type ClubInfo = {
  clubId: number;
  clubName: string;
  description: string;
  representatives: Representative[];
  advisor: string;
};

type ActivityInfo = {
  title: string;
  activityType: string;
  startDate: string;
  endDate: string;
  feedbackType: number;
};

export const ClubManage = (): JSX.Element => {
  const { typeId, clubId, isLoading } = useUserRepresentativeStatus();
  const { durationStatus } = useReportDurationStatus();
  const navigate = useNavigate();
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    clubId: 0,
    clubName: "",
    description: "",
    representatives: [],
    advisor: "",
  });
  const [activities, setActivities] = useState<ActivityInfo[]>([]);

  useEffect(() => {
    const fetchClubInfo = async () => {
      await getRequest(
        "club/club_manage",
        (data) => {
          setClubInfo({
            clubId: data.data.clubId,
            clubName: data.data.clubName,
            description: data.data.description,
            representatives: data.data.representatives,
            advisor: data.data.advisor,
          });
          fetchActivities(data.data.clubId); // Fetch activities after setting club info
        },
        (error) => {
          console.error("Error fetching club info:", error);
        }
      );
    };

    fetchClubInfo();
  }, []);

  const fetchActivities = async (clubId: any) => {
    if (clubId) {
      await getRequest(
        `activity/activity_list?club_id=${clubId}`,
        (data) => {
          setActivities(data.activities);
        },
        (error) => {
          console.error("Error fetching activities:", error);
        }
      );
    }
  };

  return (
    <div className="club-manage">
      <div className="frame-8">
        <UpperBar
          title={`${clubInfo.clubName} 동아리 관리`}
          className="upper-bar"
        />
        <div className="frame-wrapper">
          <div className="frame-12">
            {typeId === 1 && (
              <div className="frame-13">
                <SubTitle
                  className="sub-title-instance"
                  divClassName="design-component-instance-node"
                  text="동아리 대표자"
                />
                <div className="frame-14">
                  {Array.isArray(clubInfo.representatives) &&
                    clubInfo.representatives.map((rep, index) => (
                      <div key={index} className="overlap-group-wrapper">
                        <div className="overlap-group">
                          <div className="frame-15">
                            <div className="text-wrapper-8">
                              {rep.student_id > 0
                                ? `${rep.student_id} ${rep.name}`
                                : "없음"}
                            </div>
                          </div>
                          <p className="p">
                            <span className="span">
                              {index === 0 ? "대표자 :" : "대의원 :"}
                            </span>
                            <span className="text-wrapper-9">&nbsp;</span>
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            <div className="frame-16">
              <SubTitle
                className="sub-title-instance"
                divClassName="design-component-instance-node"
                text="동아리 설명"
              />
              <div className="frame-17">
                <div className="frame-18">
                  <p className="text-wrapper-10">{clubInfo.description}</p>
                </div>
              </div>
              <div className="frame-19">
                <div className="frame-20">
                  <div className="text-wrapper-11">설명 저장</div>
                </div>
              </div>
              {durationStatus > 0 && (
                <div className="frame-21">
                  <div className="frame-13">
                    <SubTitle
                      className="sub-title-instance"
                      divClassName="design-component-instance-node"
                      text="활동 보고서"
                    />
                    <div className="frame-22">
                      <Activity
                        property1="variant-2"
                        activityStateProperty1={2}
                      />
                      {activities.map((activity, index) => (
                        <Activity
                          key={index}
                          index={index + 1}
                          name={activity.title}
                          type={activity.activityType}
                          start_date={activity.startDate}
                          end_date={activity.endDate}
                          activityStateProperty1={activity.feedbackType}
                        />
                      ))}
                    </div>
                    <div className="frame-28">
                      <div
                        className="rectangle"
                        onClick={() => navigate("/add_activity")}
                        style={{ cursor: "pointer" }}
                      />
                      <div
                        className="frame-29"
                        onClick={() => navigate("/add_activity")}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="group-3">
                          <div className="overlap-group-2">
                            <div className="ellipse" />
                            <div className="text-wrapper-13">+</div>
                          </div>
                        </div>
                        <div className="text-wrapper-14">활동 추가하기</div>
                      </div>
                    </div>
                  </div>
                  {clubInfo.advisor && (
                    <div className="frame-13">
                      <SubTitle
                        className="sub-title-instance"
                        divClassName="design-component-instance-node"
                        text="지도교수 확인"
                      />
                      <div className="frame-14">
                        <p className="text-wrapper-15">
                          2023.06.17. ~ 2023.12.15. 기간 중 <br />
                          {clubInfo.clubName}의 동아리 활동이 위 활동보고서와
                          일치함을 확인하고 이에 서명합니다.
                        </p>
                      </div>
                      <div className="frame-14">
                        <div className="frame-30">
                          <div className="text-wrapper-16">
                            지도교수: {clubInfo.advisor}
                          </div>
                          <ActivityState property1="default" />
                        </div>
                        <div className="group-4">
                          <div className="frame-20">
                            <div className="text-wrapper-11">확인하기</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
