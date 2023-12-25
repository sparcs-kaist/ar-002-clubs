import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/ActivityProof";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import "./ActivityDetail.css";
import { UpperBar } from "components/UpperBar";
import { ActivityFeedback } from "components/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";

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
  members: string;
  proofText: string;
  participants: Participant[];
  proofImages: ProofImage[];
  feedbackResults: FeedbackResult[];
}

export const ActivityDetail = (): JSX.Element => {
  const { userStatuses, isLoading } = useUserRepresentativeStatus();
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
    members: "",
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
          const response = await getRequest(
            `activity/getActivity/${id}`,
            (data) => {
              // 사용자가 해당 활동의 클럽에 속해 있는지 확인
              const userClubIds = userStatuses.map((status) => status.clubId);
              if (!userClubIds.includes(data.clubId)) {
                alert("접근 권한이 없습니다. 해당 동아리원만 접근 가능합니다.");
                navigate(-1);
                return;
              }

              // 활동 데이터 설정
              setActivity({
                name: data.name,
                type: data.type,
                category: data.category,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                purpose: data.purpose,
                content: data.content,
                members: "", // Handle this based on your data structure
                proofText: data.proofText,
                participants: data.participants,
                proofImages: data.proofImages,
                feedbackResults: data.feedbackResults,
              });
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
        `activity/deleteActivity/${id}`,
        () => {},
        () => {}
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
              <div className="frame-9">
                {/* <ActivityFeedback
                  className="design-component-instance-node"
                  text="2023.12.31. 19:58:00"
                  text1="증빙 사진1의 인원이 맞지 않습니다."
                /> */}
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
        {typeId < 4 && (
          <div className="frame-16">
            <div
              className="frame-17"
              onClick={() => navigate(`/edit_activity/${id}`)}
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
