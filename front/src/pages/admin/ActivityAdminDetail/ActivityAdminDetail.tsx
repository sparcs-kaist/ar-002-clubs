import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/activity/ActivityProof";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ActivityAdminDetail.css";
import { UpperBar } from "components/home/UpperBar";
import { ActivityFeedback } from "components/activity/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import {
  useExecutiveStatus,
  useUserRepresentativeStatus,
} from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";
import { useReportDurationStatus } from "hooks/useReportDurationStatus";

interface Participant {
  student_id: string;
  name: string;
}

interface ProofImage {
  imageUrl: string;
  fileName: string; // Added this line
}

interface FeedbackResult {
  feedback_time: string;
  text: string;
}

interface ActivityState {
  name: string;
  type: number;
  category: string;
  startDate: string;
  endDate: string;
  location: string;
  purpose: string;
  content: string;
  proofText: string;
  participants: Participant[];
  proofImages: ProofImage[];
  feedbackResults: FeedbackResult[];
}

export const ActivityAdminDetail = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityState>({
    name: "",
    type: 0,
    category: "",
    startDate: "",
    endDate: "",
    location: "",
    purpose: "",
    content: "",
    proofText: "",
    participants: [],
    proofImages: [],
    feedbackResults: [],
  });

  const [reviewResult, setReviewResult] = useState("");

  const handleReviewResultChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReviewResult(event.target.value);
  };

  const handleReviewComplete = async () => {
    try {
      await postRequest(
        "feedback/feedback",
        {
          activity_id: id,
          reviewResult: reviewResult,
        },
        () => navigate(-1)
      );
      // Go back after successful submission
    } catch (error) {
      console.error("Failed to post review:", error);
      // Handle error (e.g., show an alert or message)
    }
  };

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        await getRequest(
          `feedback/getActivity/${id}`,
          (data) => {
            setActivity({
              name: data.name,
              type: data.type,
              category: data.category,
              startDate: data.startDate,
              endDate: data.endDate,
              location: data.location,
              purpose: data.purpose,
              content: data.content,
              proofText: data.proofText,
              participants: data.participants,
              proofImages: data.proofImages,
              feedbackResults: data.feedbackResults,
            });
          },
          (error) => {
            console.error(error);
            alert("권한이 없습니다.");
            navigate(-1);
          }
        );
      } catch (error) {
        console.error("Error fetching activity data:", error);
        // 에러 처리 로직
      }
    };

    if (id) {
      fetchActivityData();
    }
  }, [id]);

  const renderParticipants = () => {
    return activity.participants.map((participant, index) => (
      <span
        key={index}
        className="participant-tag"
        style={{ fontSize: "20px", width: "1000px" }}
      >
        {participant.name},
      </span>
    ));
  };

  const groupProofImagesInPairs = () => {
    const pairs = [];
    for (let i = 0; i < activity.proofImages.length; i += 2) {
      pairs.push(activity.proofImages.slice(i, i + 2));
    }
    return pairs;
  };

  // Grouped proof images
  const groupedProofImages = groupProofImagesInPairs();

  const renderActivityFeedback = () => {
    return activity.feedbackResults.map((feedback, index) => (
      <ActivityFeedback
        key={index}
        text={feedback.feedback_time}
        text1={feedback.text}
      />
    ));
  };

  return (
    <div className="add-activity">
      <div className="frame-3">
        <UpperBar title={activity.name} className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="활동 정보" />
              <div className="frame-9">
                <p className="div-3">
                  <span className="span">활동 분류:</span>
                  <span className="text-wrapper-8">
                    {activity.type === 1
                      ? "동아리 성격에 합치하지 않는 활동"
                      : activity.type === 2
                      ? "동아리 성격에 합치하는 내부 활동"
                      : "동아리 성격에 합치하는 외부 활동"}
                  </span>
                </p>
                <p className="div-3">
                  <span className="span">시작 일시:</span>
                  <span className="text-wrapper-8">{activity.startDate}</span>
                </p>
                <p className="div-3">
                  <span className="span">종료 일시:</span>
                  <span className="text-wrapper-8">{activity.endDate}</span>
                </p>
                <p className="div-3">
                  <span className="span">장소:</span>
                  <span className="text-wrapper-8" style={{ width: "962px" }}>
                    {activity.location}
                  </span>
                </p>
                <p className="div-3">
                  <span className="span">활동 목적:</span>
                  <span className="text-wrapper-8" style={{ width: "922px" }}>
                    {activity.purpose}
                  </span>
                </p>
              </div>
            </div>
            <div className="frame-10">
              <SubTitle className="sub-title-instance" text="참여 회원" />
              <div className="frame-9">
                <p className="div-2">
                  <span className="span">총원:</span>
                  <span className="text-wrapper-8">
                    {" "}
                    {activity.participants.length}명
                  </span>
                </p>
                <div className="participants-input">{renderParticipants()}</div>
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="활동 내용" />
              <div className="frame-9">
                <div className="text-wrapper-10" style={{ height: "300px" }}>
                  {activity.content}
                </div>
              </div>
            </div>
            <div className="frame-12">
              <SubTitle className="sub-title-instance" text="활동 증빙" />
              <div className="frame-9">
                <div className="text-wrapper-10" style={{ height: "150px" }}>
                  {activity.proofText}
                </div>
              </div>
              <div className="frame-9">
                {groupedProofImages.map((pair, pairIndex) => (
                  <div key={pairIndex} className="frame-13">
                    {pair.map((image, index) => (
                      <ActivityProof
                        key={index}
                        url={image.imageUrl}
                        className="activity-proof-instance"
                        property1="variant-2"
                        fileName={image.fileName}
                        // onDelete={handleDeleteImage}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="검토 결과" />
              <div className="frame-9">
                <textarea
                  className="text-area"
                  value={reviewResult}
                  onChange={handleReviewResultChange}
                />
                <div className="frame-14">
                  <div
                    className="frame-15"
                    style={{ cursor: "pointer" }}
                    onClick={handleReviewComplete}
                  >
                    <div className="text-wrapper-11">검토 완료</div>
                  </div>
                </div>
                {renderActivityFeedback()}
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
        {/* {typeId < 4 && (
          <div className="frame-16">
            <div
              className="frame-17"
              onClick={() => navigate(`/edit_activity/${id}`)}
              style={{ cursor: "pointer" }}
            >
              수정
            </div>
            {durationStatus == 1 && (
              <div
                className="frame-17"
                onClick={handleDeleteActivity}
                style={{ cursor: "pointer" }}
              >
                삭제
              </div>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
};
