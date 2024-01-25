import React, { useEffect, useState } from "react";
import { ActivityFeedbackList } from "components/admin/ActivityFeedbackList";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./FundingFeedbackScreen.css";
import { UpperBar } from "components/home/UpperBar";
import { getRequest } from "utils/api";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";
import { FundingFeedbackList } from "components/admin/\bFundingFeedbackList";

interface ActivityFeedbackData {
  activityId: number;
  clubName: string;
  activityName: string;
  feedbackMemberName: string;
  expenditureAmount: number;
  approvedAmount: number;
  feedbackType: number;
}

export const FundingFeedbackScreen = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const [feedbackActivities, setFeedbackActivities] = useState<
    ActivityFeedbackData[]
  >([]);

  useEffect(() => {
    getRequest(
      "funding_feedback/my_feedback_funding", // Replace with your actual API endpoint
      (data) => {
        setFeedbackActivities(data);
        console.log(data);
      },
      (error) => console.error("Error fetching activity feedback data:", error)
    );
  }, []);

  return (
    <div className="activity-feedback-screen">
      <div className="frame-6">
        <UpperBar className={"upper-bar"} title={"지원금 신청 검토하기"} />
        <div className="frame-wrapper">
          <div className="frame-10">
            <div className="frame-11">
              <div className="frame-12">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    text="지원금 신청 검토"
                  />
                  <div className="frame-14">
                    <FundingFeedbackList title="zero" />
                    {Array.isArray(feedbackActivities) &&
                      feedbackActivities.map((activity, index) => (
                        <FundingFeedbackList
                          key={index}
                          title="one"
                          index={String(index + 1)}
                          club={activity.clubName}
                          activity={activity.activityName}
                          expenditureAmount={`${activity.expenditureAmount}원`}
                          approvedAmount={`${activity.approvedAmount}원`}
                          doneby={activity.feedbackMemberName}
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
