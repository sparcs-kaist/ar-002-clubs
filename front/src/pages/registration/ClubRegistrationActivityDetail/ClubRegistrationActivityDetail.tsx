import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/activity/ActivityProof";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubRegistrationActivityDetail.css";
import { UpperBar } from "components/home/UpperBar";
import { ActivityFeedback } from "components/activity/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";
import {
  useRegistrationDurationStatus,
  useReportDurationStatus,
} from "hooks/useReportDurationStatus";

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

export const ClubRegistrationActivityDetail = (): JSX.Element => {
  const { userStatuses, isLoading } = useUserRepresentativeStatus(true);
  const { durationStatus } = useRegistrationDurationStatus();
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

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [originalSearchResults, setOriginalSearchResults] = useState<
    Participant[]
  >([]);

  const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  const typeId = userStatuses.length > 0 ? userStatuses[0].typeId : 0;

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!isLoading) {
        try {
          await getRequest(
            `registration/getActivity/${id}`,
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
      }
    };

    if (id) {
      fetchActivityData();
    }
  }, [id, isLoading]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchMember(value); // 사용자 입력에 따라 회원 검색
  };

  const searchMember = async (query: string) => {
    // if (!query) {
    //   setSearchResults([]);
    //   return;
    // }

    // 서버에 검색 쿼리를 보내고 결과를 받아옵니다.
    getRequest(
      `activity/search_members?club_id=${clubId}&query=${query}`, // 클럽 ID와 검색 쿼리를 포함한 URL
      (data) => {
        const newSearchResults = data.members.filter(
          (member: Participant) =>
            !activity.participants.some(
              (participant) => participant.student_id === member.student_id
            )
        );
        setSearchResults(newSearchResults);
        setOriginalSearchResults(data.members);
      },
      (error) => {
        console.error("Error fetching members:", error);
      }
    );
  };

  const addParticipant = (participant: Participant) => {
    setActivity({
      ...activity,
      participants: [...activity.participants, participant],
    });

    // Remove added participant from search results
    const updatedSearchResults = searchResults.filter(
      (member) => member.student_id !== participant.student_id
    );
    setSearchResults(updatedSearchResults);
  };

  const removeParticipant = (index: number) => {
    const removedParticipant = activity.participants[index];
    const newParticipants = activity.participants.filter(
      (_, idx) => idx !== index
    );
    setActivity({ ...activity, participants: newParticipants });

    // If removed participant was originally in the search results, add them back
    if (
      originalSearchResults.some(
        (member) => member.student_id === removedParticipant.student_id
      )
    ) {
      setSearchResults([...searchResults, removedParticipant]);
    }
  };

  const addAllParticipants = () => {
    setActivity({
      ...activity,
      participants: [...activity.participants, ...searchResults],
    });
    setSearchResults([]); // Clear search results after adding all to participants
  };

  const removeAllParticipants = () => {
    setActivity({ ...activity, participants: [] });
    setSearchResults(originalSearchResults); // Reset search results to original state
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setActivity({ ...activity, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity({ ...activity, type: parseInt(e.target.value) });
  };

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

  const handleDeleteImage = async (fileName: string) => {
    // Confirm before deleting
    const confirmDelete = window.confirm("첨부 파일을 삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // Stop if the user cancels
    }

    // Remove from local state
    const newProofImages = activity.proofImages.filter(
      (image) => image.fileName !== fileName
    );
    setActivity((prevState) => ({ ...prevState, proofImages: newProofImages }));

    // Make a request to delete from S3
    try {
      const deleteResponse = await postRequest(
        `activity/deleteImage`,
        { fileName },
        () => {}
      );
      // Handle the deleteResponse as needed
    } catch (error) {
      console.error("Error deleting file:", error);
      // Handle the error
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();

    // Generate a timestamp
    const timestamp = new Date().toISOString().replace(/:/g, "-");

    // Append the file with a timestamp
    const newFileName = `${timestamp}_${file.name}`;
    formData.append("file", file, newFileName);

    const handleSuccess = (response: any) => {
      const uploadedFileUrl = response.data.data.Location;

      // Save the original file name in the state
      setActivity((prevState) => ({
        ...prevState,
        proofImages: [
          ...prevState.proofImages,
          { imageUrl: uploadedFileUrl, fileName: file.name },
        ],
      }));
    };

    const handleError = (error: any) => {
      console.error("Error uploading file:", error);
    };

    postRequest("activity/upload", formData, handleSuccess, handleError);
  };

  const handleDeleteActivity = async () => {
    const confirmDelete = window.confirm("활동을 삭제하시겠습니까?");
    if (!confirmDelete) {
      return; // Stop if the user cancels
    }

    try {
      await postRequest(
        `registration/deleteActivity/${id}`,
        {},
        () => {},
        (error) => {
          console.error(error);
          alert("활동을 삭제하는 중 에러가 발생했습니다. 다시 시도해주세요.");
        }
      );
      navigate("/club_manage");
    } catch (error) {
      console.error("Error deleting activity:", error);
      // Optionally, handle the error (e.g., show error message)
    }
  };

  useEffect(() => {
    searchMember(""); // Call this with an empty string to fetch all members initially
  }, [clubId]);

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
                        onDelete={handleDeleteImage}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="검토 결과" />
              <div className="frame-9">{renderActivityFeedback()}</div>
            </div>
          </div>
        </div>
        <UnderBar />
        {typeId < 4 && durationStatus > 0 && (
          <div className="frame-16">
            <div
              className="frame-17"
              onClick={() => navigate(`/club_registration/edit_activity/${id}`)}
              style={{ cursor: "pointer" }}
            >
              수정
            </div>
            <div
              className="frame-17"
              onClick={handleDeleteActivity}
              style={{ cursor: "pointer" }}
            >
              삭제
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
