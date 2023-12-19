import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/ActivityProof";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import "./AddActivity.css";
import { UpperBar } from "components/UpperBar";
import { ActivityFeedback } from "components/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserRepresentativeStatus";

interface Participant {
  student_id: string;
  name: string;
}

interface ProofImage {
  imageUrl: string;
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

export const AddActivity = (): JSX.Element => {
  const { typeId, clubId, isLoading } = useUserRepresentativeStatus();
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
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});

  const getFileUrl = async (key: string): Promise<string | null> => {
    try {
      let preSignedUrl = "";
      await getRequest(`get_file_url?key=${key}`, (response) => {
        preSignedUrl = response.data.url;
      });
      return preSignedUrl;
    } catch (error) {
      console.error("Error fetching file URL:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchFileUrls = async () => {
      const urls: { [key: string]: string } = {};
      for (const image of activity.proofImages) {
        const url = await getFileUrl(image.imageUrl);
        if (url) {
          urls[image.imageUrl] = url;
        }
      }
      setFileUrls(urls);
    };

    if (activity.proofImages.length > 0) {
      fetchFileUrls();
    }
  }, [activity.proofImages]);

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
        onClick={() => removeParticipant(index)}
      >
        {participant.name}
        <button>X</button>
      </span>
    ));
  };

  const handleFileUpload = async (file: File) => {
    // Request a pre-signed URL from the backend
    try {
      postRequest(
        "activity/file_upload",
        {
          file_name: file.name,
        },
        async (data) => {
          // Use the pre-signed URL to upload the file
          const { url, key } = data.data;

          await fetch(url, {
            method: "PUT",
            body: file, // directly pass the file here
            headers: {
              "Content-Type": file.type, // set the content type header
            },
          });

          // Update state with the URL of the uploaded file
          setActivity({
            ...activity,
            proofImages: [...activity.proofImages, { imageUrl: key }],
          });
        }
      );
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = async () => {
    // Implement logic to send data to the server
  };

  useEffect(() => {
    searchMember(""); // Call this with an empty string to fetch all members initially
  }, [clubId]);

  return (
    <div className="add-activity">
      <div className="frame-3">
        <UpperBar className={"upper-bar"} />
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
              </div>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {activity.proofImages.map((image, index) => (
                <ActivityProof
                  key={index}
                  property1="default"
                  url={fileUrls[image.imageUrl]}
                  className="activity-proof-instance"
                />
              ))}
              {/* <div className="frame-9">
                <div className="frame-13">
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="variant-2"
                  />
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                </div>
                <div className="frame-13">
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                  <ActivityProof
                    className="activity-proof-instance"
                    property1="default"
                  />
                </div>
              </div> */}
              <div className="frame-14">
                <div className="frame-15" onClick={handleSubmit}>
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
