import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useExecutiveStatus,
  useUserRepresentativeStatus,
} from "hooks/useUserPermission";
import { Activity } from "components/activity/Activity";
import { ActivityState } from "components/activity/ActivityState";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import { UpperBar } from "components/home/UpperBar";
import "./ActivityDashboard.css";
import { getRequest, postRequest } from "utils/api";
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
  id: number;
  title: string;
  activityType: string;
  startDate: string;
  endDate: string;
  feedbackType: number;
};

export const ActivityDashboard = (): JSX.Element => {
  const userRepresentativeStatuses = useUserRepresentativeStatus(); // 배열을 반환한다고 가정
  const { executiveStatuses } = useExecutiveStatus();
  const { durationStatus } = useReportDurationStatus();
  const [clubInfos, setClubInfos] = useState<{ [key: number]: ClubInfo }>({});
  const [advisorSignedStatus, setAdvisorSignedStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [activitiesLists, setActivitiesLists] = useState<{
    [key: number]: ActivityInfo[];
  }>({});
  const [memberLists, setMemberLists] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [loadedClubIds, setLoadedClubIds] = useState<number[]>([]);

  useEffect(() => {
    userRepresentativeStatuses.userStatuses.forEach((status) => {
      const { clubId } = status;
      // 이미 로드된 clubId의 데이터는 다시 요청하지 않도록 함
      if (loadedClubIds.includes(clubId)) {
        return;
      }
      // 이미 로드된 clubId가 아니면 요청을 보냄
      const fetchClubMembers = async () => {
        getRequest(
          `club/club_members/${clubId}`,
          (data) => {
            setMemberLists((prevMemberLists) => ({
              ...prevMemberLists,
              [status.clubId]: data.map(
                (member: { student_id: any; name: any }) =>
                  `${member.student_id} ${member.name}`
              ),
            }));
            // 현재 로드된 clubId 목록에 추가
            setLoadedClubIds((prevIds) => [...prevIds, status.clubId]);
          },
          (error) => {
            console.error("Error fetching club members:", error);
          }
        );
      };
      const fetchActivities = async () => {
        await getRequest(
          `activity/activity_list?club_id=${clubId}`,
          (data) => {
            console.log(data);
            setActivitiesLists((activitiesLists) => ({
              ...activitiesLists,
              [clubId]: data.activities,
            }));
          },
          (error) => {
            console.error("Error fetching activities:", error);
          }
        );
      };
      const fetchClubInfo = async () => {
        await getRequest(
          `club/club_manage/?club_id=${status.clubId}`,
          (data) => {
            setClubInfos((clubInfos) => ({
              ...clubInfos,
              [status.clubId]: {
                clubId: status.clubId,
                clubName: data.data.clubName,
                description: data.data.description,
                representatives: data.data.representatives,
                advisor: data.data.advisor,
                sign: false,
              },
            }));
            fetchActivities(); // Fetch activities after setting club info
          },
          (error) => {
            console.error("Error fetching club info:", error);
          }
        );
      };
      fetchClubMembers();
      fetchClubInfo();
      setLoadedClubIds((prevIds) => [...prevIds, clubId]);
    });
  }, [userRepresentativeStatuses, clubInfos, loadedClubIds]);

  const checkAdvisorSignStatus = async (clubId: number) => {
    await getRequest(
      `activity/advisor_sign?club_id=${clubId}`,
      (data) => {
        setAdvisorSignedStatus((prevStatus) => ({
          ...prevStatus,
          [clubId]: data.signed,
        }));
      },
      (error) => {
        console.error("Error fetching sign status:", error);
      }
    );
  };

  useEffect(() => {
    userRepresentativeStatuses.userStatuses.forEach((status) => {
      const { clubId } = status;
      if (loadedClubIds.includes(clubId)) {
        return;
      }
      // existing code for fetching club members and club info
      checkAdvisorSignStatus(clubId); // Check advisor sign status for each club
      setLoadedClubIds((prevIds) => [...prevIds, clubId]);
    });
  }, [userRepresentativeStatuses, loadedClubIds]);

  return (
    <div className="activity-dashboard">
      <div className="frame-8">
        <UpperBar title={`활동 보고서 대시보드`} className="upper-bar" />
        <div className="frame-wrapper">
          {userRepresentativeStatuses.userStatuses.map((status, index) => {
            const currentClubInfo = clubInfos[status.clubId];
            if (!currentClubInfo) {
              // Data for this clubId has not been loaded yet
              return null; // or you can return a loader, placeholder, etc.
            }

            return (
              <div key={index} className="frame-12">
                <div className="frame-16">
                  {durationStatus > 0 && (
                    <div className="frame-21" style={{ marginBottom: "80px" }}>
                      <div className="frame-13">
                        <SubTitle
                          className="sub-title-instance"
                          divClassName="design-component-instance-node"
                          text={`활동 보고서`}
                        />
                        <div className="frame-22">
                          <Activity
                            property1="variant-2"
                            activityStateProperty1={2}
                            id={0}
                          />
                          {activitiesLists[status.clubId]?.map(
                            (activity, index) => (
                              <Activity
                                key={index}
                                index={index + 1}
                                name={activity.title}
                                type={activity.activityType}
                                start_date={activity.startDate}
                                end_date={activity.endDate}
                                activityStateProperty1={activity.feedbackType}
                                id={activity.id}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
