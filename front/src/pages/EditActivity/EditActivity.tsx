import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/ActivityProof";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import "./EditActivity.css";
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

export const EditActivity = (): JSX.Element => {
  const { typeId, clubId, isLoading } = useUserRepresentativeStatus();
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

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const response = await getRequest(
          `activity/getActivity/${id}`,
          (data) => {
            // Check if the user has permission to access this activity
            if (!isLoading && data.clubId !== clubId) {
              navigate(-1);
              // alert("접근 권한이 없습니다. 해당 동아리원만 접근 가능합니다.");
            }
            if (!isLoading && data.clubId == clubId) {
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
          }
        );
      } catch (error) {
        console.error("Error fetching activity data:", error);
        alert(
          `활동을 저장하는 도중 오류가 발생했습니다. 입력한 정보를 다시 확인해주세요. ${error}`
        );
        // Handle errors (e.g., show error message)
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
      `activity/search_members?club_id=${clubId}&query=${query}&start_date=${activity.startDate}&end_date=${activity.endDate}`, // 클럽 ID와 검색 쿼리를 포함한 URL
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
        onClick={() => removeParticipant(index)}
      >
        {participant.name}
        <button>X</button>
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

  const handleFileUpload = async (file: any) => {
    const formData = new FormData();

    // Append the file without modifying the name
    formData.append("file", file);

    const handleSuccess = (response: {
      data: { fileDetails: { location: any } };
    }) => {
      const uploadedFileUrl = response.data.fileDetails.location; // Ensure this matches the response structure

      // Save the uploaded file URL and original file name in the state
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
      alert(
        `파일을 업로드하는 도중 오류가 발생했습니다. 파일을 다시 확인해주세요. ${error}`
      );
    };

    postRequest("activity/upload", formData, handleSuccess, handleError);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      clubId,
      activity.name,
      activity.type,
      activity.startDate,
      activity.endDate,
      activity.location,
      activity.purpose,
      activity.participants.length, // Check if there are participants
    ];

    const isAnyFieldEmpty = requiredFields.some((field) => !field);

    if (isAnyFieldEmpty) {
      alert("비어 있는 값이 있습니다. 다시 확인해주세요.");
      return;
    }

    // Validation for date range and order
    const startDate = new Date(activity.startDate);
    const endDate = new Date(activity.endDate);
    const minDate = new Date("2023-06-17");
    const maxDate = new Date("2023-12-15");

    if (
      startDate > endDate ||
      startDate < minDate ||
      endDate > maxDate ||
      endDate < minDate
    ) {
      alert("날짜 범위가 올바르지 않습니다. 다시 확인해주세요.");
      return;
    }
    // Prepare the data to be sent
    const dataToSend = {
      activityId: id,
      clubId, // Assuming clubId is obtained from useUserRepresentativeStatus or similar context
      name: activity.name,
      type: activity.type,
      category: activity.category,
      startDate: activity.startDate,
      endDate: activity.endDate,
      location: activity.location,
      purpose: activity.purpose,
      content: activity.content,
      proofText: activity.proofText,
      participants: activity.participants,
      proofImages: activity.proofImages,
      feedbackResults: activity.feedbackResults,
    };

    // Success callback
    const handleSuccess = (response: any) => {
      console.log("Activity added successfully:", response);
      const activityId = response.data.activityId; // Adjust according to your API response structure
      navigate(`/activity_detail/${activityId}`);
      // Additional success logic here (e.g., redirecting or showing a success message)
    };

    // Error callback
    const handleError = (error: any) => {
      console.error("Error adding activity:", error);
      // Additional error handling logic here (e.g., showing an error message)
    };

    // Send the POST request
    postRequest(
      "activity/editActivity",
      dataToSend,
      handleSuccess,
      handleError
    );
  };

  useEffect(() => {
    removeAllParticipants();
    activity.participants = [];
    searchMember(""); // Call this with an empty string to fetch all members initially
  }, [clubId, activity.startDate, activity.endDate]);

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
        <UpperBar title={"활동 수정하기"} className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="활동 정보" />
              <div className="frame-9">
                <p className="div-2">
                  <span className="span">활동명: </span>
                  <input
                    type="text"
                    name="name"
                    value={activity.name}
                    onChange={handleChange}
                    placeholder="활동명을 입력하세요."
                    className="text-wrapper-8"
                    style={{ width: "942px" }}
                  />
                </p>
                <p className="div-3">
                  <div className="dropdown-container">
                    <label className="span" htmlFor="activity-type">
                      활동 분류:
                    </label>
                    <select
                      name="type"
                      id="activity-type"
                      value={activity.type}
                      onChange={handleTypeChange}
                      className="text-wrapper-8"
                    >
                      <option value="0">분류 선택...</option>
                      <option value="1">
                        동아리 성격에 합치하지 않는 활동
                      </option>
                      <option value="2">
                        동아리 성격에 합치하는 내부 활동
                      </option>
                      <option value="3">
                        동아리 성격에 합치하는 외부 활동
                      </option>
                    </select>
                  </div>
                </p>
                <p className="div-3">
                  <span className="span">시작 일시:</span>
                  <input
                    type="date"
                    name="startDate"
                    value={activity.startDate}
                    onChange={handleChange}
                    placeholder="시작 일시"
                    className="text-wrapper-8"
                  />
                </p>
                <p className="div-3">
                  <span className="span">종료 일시:</span>
                  <input
                    type="date"
                    name="endDate"
                    value={activity.endDate}
                    onChange={handleChange}
                    placeholder="종료 일시"
                    className="text-wrapper-8"
                  />
                </p>
                <p className="div-3">
                  <span className="span">장소:</span>
                  <input
                    type="text"
                    name="location"
                    value={activity.location}
                    onChange={handleChange}
                    placeholder="장소를 입력하세요."
                    className="text-wrapper-8"
                    style={{ width: "962px" }}
                  />
                </p>
                <p className="div-3">
                  <span className="span">활동 목적:</span>
                  <input
                    className="text-wrapper-8"
                    name="purpose"
                    value={activity.purpose}
                    onChange={handleChange}
                    placeholder="활동 목적을 입력하세요."
                    style={{ width: "922px" }}
                  />
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
                <div className="participants-input">
                  {renderParticipants()}
                  <div>
                    <button onClick={addAllParticipants}>전체 선택</button>
                    <button onClick={removeAllParticipants}>전체 삭제</button>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={
                      activity.participants.length ? "" : "회원 검색..."
                    }
                    className="text-wrapper-10"
                  />
                </div>
                {searchResults && searchResults.length > 0 && (
                  <ul className="search-results">
                    {searchResults.map((member, index) => (
                      <li key={index} onClick={() => addParticipant(member)}>
                        {member.name} {member.student_id}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="frame-11">
              <SubTitle className="sub-title-instance" text="활동 내용" />
              <div className="frame-9">
                <textarea
                  name="content"
                  value={activity.content}
                  onChange={handleChange}
                  placeholder="활동 내용을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "300px" }}
                />
              </div>
            </div>
            <div className="frame-12">
              <SubTitle className="sub-title-instance" text="활동 증빙" />
              <div className="frame-9">
                <textarea
                  name="proofText"
                  value={activity.proofText}
                  onChange={handleChange}
                  placeholder="활동 증빙을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "150px" }}
                />
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="frame-9">
                {groupedProofImages.map((pair, pairIndex) => (
                  <div key={pairIndex} className="frame-13">
                    {pair.map((image, index) => (
                      <ActivityProof
                        key={index}
                        url={image.imageUrl}
                        className="activity-proof-instance"
                        property1="default"
                        fileName={image.fileName}
                        onDelete={handleDeleteImage}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="frame-14">
                <div
                  className="frame-15"
                  onClick={handleSubmit}
                  style={{ cursor: "pointer" }}
                >
                  <div className="text-wrapper-11">활동 저장</div>
                </div>
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
      </div>
    </div>
  );
};
