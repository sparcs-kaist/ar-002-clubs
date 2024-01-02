import React, { useEffect, useState } from "react";
import { ActivityFeedbackList } from "components/admin/ActivityFeedbackList";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ActivityFeedbackScreen.css";
import { UpperBar } from "components/home/UpperBar";
import { getRequest } from "utils/api";

interface ActivityFeedbackData {
  activityId: number;
  clubName: string;
  activityName: string;
  feedbackMemberName: string;
  executiveMemberName: string;
  feedbackType: number;
}

export const ActivityFeedbackScreen = (): JSX.Element => {
  const [feedbackActivities, setFeedbackActivities] = useState<
    ActivityFeedbackData[]
  >([]);

  useEffect(() => {
    getRequest(
      "feedback/my_feedback_activity", // Replace with your actual API endpoint
      (data) => setFeedbackActivities(data),
      (error) => console.error("Error fetching activity feedback data:", error)
    );
  }, []);

  return (
    <div className="activity-feedback-screen">
      <div className="frame-6">
        <UpperBar className={"upper-bar"} title={"활동 보고서 검토하기"} />
        <div className="frame-wrapper">
          <div className="frame-10">
            <div className="frame-11">
              <div className="frame-12">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    text="활동 보고서 검토"
                  />
                  <div className="frame-14">
                    <ActivityFeedbackList title="zero" />
                    {Array.isArray(feedbackActivities) &&
                      feedbackActivities.map((activity, index) => (
                        <ActivityFeedbackList
                          key={index}
                          title="one"
                          index={String(index + 1)}
                          club={activity.clubName}
                          activity={activity.activityName}
                          doneby={activity.feedbackMemberName}
                          chargeof={activity.executiveMemberName}
                          state={activity.feedbackType}
                          activity_id={activity.activityId}
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
