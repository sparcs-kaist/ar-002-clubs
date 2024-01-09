import React, { useEffect, useState } from "react";
import { DashboardActivity } from "components/admin/DashboardActivity";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubActivityList.css";
import { UpperBar } from "components/home/UpperBar";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";
import { useNavigate, useParams } from "react-router-dom";
import { getRequest } from "utils/api";

interface Activity {
  activityId: number;
  title: string;
  recent_edit: string;
  recent_feedback: string;
  feedbackMemberName: string;
  executiveName: string;
  executive_id: number;
  feedbackType: number;
}

export const ClubActivityList = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const { id } = useParams();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clubName, setClubName] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      getRequest(
        `feedback/club_activity_list?club_id=${id}`,
        (data) => {
          console.log(data);
          setActivities(data.activities);
          setClubName(data.clubName);
        },
        (error) => console.error("Failed to fetch activities:", error)
      );
    };

    fetchActivities();
  }, [id]);

  return (
    <div className="club-activity-list">
      <div className="frame-6">
        <UpperBar className={"upper-bar"} title={`${clubName} 활동 보고서`} />
        <div className="frame-wrapper">
          <div className="frame-10">
            <div className="frame-11">
              <div className="frame-12">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    text="활동 보고서 검토 현황"
                  />
                  <div className="frame-14">
                    <DashboardActivity
                      type="zero"
                      activityStateProperty1="default"
                    />
                    {Array.isArray(activities) &&
                      activities.map((activity, index) => (
                        <DashboardActivity
                          key={index}
                          type="one"
                          clubId={parseInt(id ? id : "0")}
                          activityId={activity.activityId}
                          number={(index + 1).toString()}
                          title={activity.title}
                          editedTime={activity.recent_edit}
                          feedbackTime={activity.recent_feedback}
                          feedbackName={activity.feedbackMemberName}
                          executiveName={activity.executiveName}
                          executiveId={activity.executive_id}
                          feedbackState={activity.feedbackType}
                        />
                      ))}
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
