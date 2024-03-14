import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/activity/ActivityProof";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./AddClubRegistration.css";
import { UpperBar } from "components/home/UpperBar";
import { ActivityFeedback } from "components/activity/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";
import {
  useRegistrationDurationStatus,
  useReportDurationStatus,
} from "hooks/useReportDurationStatus";
import { Activity } from "components/activity/Activity";

interface ProofImage {
  imageUrl: string;
  fileName: string; // Added this line
}

interface ActivityInfo {
  id: number;
  title: string;
  activityType: string;
  startDate: string;
  endDate: string;
  feedbackType: number;
}

interface RegistrationState {
  prevName: string;
  currentName: string;
  phoneNumber: string;
  foundingYear: number;
  foundingMonth: number;
  division: number;
  isSelectiveAdvisor: boolean;
  advisorName: string;
  advisorEmail: string;
  advisorLevel: number;
  characteristicKr: string;
  characteristicEn: string;
  divisionConsistency: string;
  purpose: string;
  mainPlan: string;
  activityReport: ActivityInfo[];
  activityPlan: ProofImage[];
  regulation: ProofImage[];
  externalTeacher: ProofImage[];
  advisorPlan: string;
  representativeSignature: boolean;
  advisorSignature: boolean;
}

const initialState: RegistrationState = {
  prevName: "",
  currentName: "",
  foundingMonth: 1,
  foundingYear: 2000,
  phoneNumber: "010",
  division: 0,
  isSelectiveAdvisor: false,
  advisorName: "",
  advisorEmail: "",
  advisorLevel: 0,
  characteristicKr: "",
  characteristicEn: "",
  divisionConsistency: "",
  purpose: "",
  mainPlan: "",
  activityReport: [],
  activityPlan: [],
  regulation: [],
  externalTeacher: [],
  advisorPlan: "",
  representativeSignature: false,
  advisorSignature: false,
};

export const AddClubRegistration = ({ type = "provisional" }): JSX.Element => {
  const { userStatuses, isLoading } = useUserRepresentativeStatus(true);
  const { durationStatus } = useRegistrationDurationStatus();
  const navigate = useNavigate();

  const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  console.log(clubId);
  const typeId = userStatuses.length > 0 ? userStatuses[0].typeId : 0;

  const [registration, setRegistration] = useState<RegistrationState>(() => {
    // Try to load the registration state from local storage
    const savedRegistration = localStorage.getItem("registration");
    return savedRegistration ? JSON.parse(savedRegistration) : initialState;
  });

  useEffect(() => {
    // This effect runs when the registration state changes.
    // Save the updated registration state to local storage
    localStorage.setItem("registration", JSON.stringify(registration));
  }, [registration]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!clubId) {
        return;
      }
      console.log(`Fetching activities for clubId: ${clubId}`);
      await getRequest(
        `registration/activity_list?club_id=${clubId}`,
        (data) => {
          setRegistration({ ...registration, activityReport: data.activities });
          console.log(data.activities);
        },
        (error) => {
          console.error("Error fetching activities:", error);
        }
      );
    };

    const fetchAdditionalInfo = async () => {
      if (!clubId) {
        return;
      }
      console.log(`Fetching activities for clubId: ${clubId}`);
      await getRequest(
        `registration/additional_info?club_id=${clubId}`,
        (data) => {
          const {
            prevName,
            advisorName,
            advisorEmail,
            foundingYear,
            isSelectiveAdvisor,
            characteristicEn,
            characteristicKr,
            division,
          } = data.data;
          setRegistration((prevState) => ({
            ...prevState,
            prevName,
            currentName: prevName,
            foundingYear,
            isSelectiveAdvisor,
            advisorName,
            advisorEmail,
            characteristicEn,
            characteristicKr,
            division,
          }));
        },
        (error) => {
          console.error("Error fetching activities:", error);
        }
      );
    };
    {
      type === "promotional" && fetchActivities();
    }
    {
      (type === "promotional" || type === "renewal") && fetchAdditionalInfo();
    }
  }, [clubId]); // clubId를 의존성 배열에 추가

  const noChange = () => {};

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const inputValue = isCheckbox
      ? (e.target as HTMLInputElement).checked
      : value;

    setRegistration({ ...registration, [name]: inputValue });
  };

  const handleSubmit = async () => {
    let requiredFields = [registration.currentName, registration.division];
    if (type === "provisional") {
      if (!registration.representativeSignature) {
        alert("대표자 서명이 필요합니다.");
        return;
      }
    } else if (type === "promotional") {
      if (!registration.representativeSignature) {
        alert("대표자 서명이 필요합니다.");
        return;
      }
    } else if (type === "renewal") {
    }

    const isAnyFieldEmpty = requiredFields.some((field) => !field);

    if (isAnyFieldEmpty) {
      alert("비어 있는 값이 있습니다. 다시 확인해주세요.");
      return;
    }

    // const expenditureDate = new Date(funding.expenditureDate);
    // if (expenditureDate < minDate || expenditureDate > maxDate) {
    //   alert("날짜 범위가 올바르지 않습니다. 다시 확인해주세요.");
    //   return;
    // }

    // Prepare the data to be sent
    const dataToSend = {
      ...registration,
      clubId,
      typeId: type === "provisional" ? 1 : type === "promotional" ? 2 : 3,
    };

    // Success callback
    const handleSuccess = (response: any) => {
      console.log("Activity added successfully:", response);
      setRegistration(initialState);
      navigate("/club_registration");
      // Additional success logic here (e.g., redirecting or showing a success message)
    };

    // Error callback
    const handleError = (error: any) => {
      console.error("Error adding activity:", error);
      alert(
        "등록 신청을 추가하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요"
      );
      // Additional error handling logic here (e.g., showing an error message)
    };

    // Send the POST request
    postRequest(
      "registration/add_registration",
      dataToSend,
      handleSuccess,
      handleError
    );
  };

  const handleFileUpload = async (file: File, imageTypePath: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const handleSuccess = (response: {
      data: { fileDetails: { location: string } };
    }) => {
      const uploadedFileUrl = response.data.fileDetails.location;
      const pathParts = imageTypePath.split(".");

      setRegistration((prevState) => {
        // Clone the state to avoid direct mutation
        const newState = JSON.parse(JSON.stringify(prevState));

        let current: any = newState;
        for (let i = 0; i < pathParts.length - 1; i++) {
          current = current[pathParts[i]] as any;
        }

        // Add the new image
        const lastKey = pathParts[pathParts.length - 1];
        if (!Array.isArray(current[lastKey])) {
          current[lastKey] = [];
        }
        current[lastKey].push({
          imageUrl: uploadedFileUrl,
          fileName: file.name,
        });

        return newState;
      });
    };

    const handleError = (error: any) => {
      console.error("Error uploading file:", error);
      alert(
        `파일을 업로드하는 도중 오류가 발생했습니다. 파일을 다시 확인해주세요. ${error}`
      );
    };

    postRequest("activity/upload", formData, handleSuccess, handleError);
  };

  const groupProofImagesInPairs = (imageTypePath: string): ProofImage[][] => {
    const pathParts = imageTypePath.split(".");
    let current: any = registration;
    for (const part of pathParts) {
      current = current[part] as any;
    }
    const images: ProofImage[] = current as ProofImage[];

    const pairs: ProofImage[][] = [];
    for (let i = 0; i < images.length; i += 2) {
      pairs.push(images.slice(i, i + 2));
    }
    return pairs;
  };

  const handleDeleteImage = async (fileName: string, imageTypePath: string) => {
    const confirmDelete = window.confirm("첨부 파일을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const pathParts = imageTypePath.split(".");

    setRegistration((prevState) => {
      const newState = { ...prevState };
      let current: any = newState;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]] as any;
      }
      current[pathParts[pathParts.length - 1]] = (
        current[pathParts[pathParts.length - 1]] as ProofImage[]
      ).filter((image) => image.fileName !== fileName);
      return newState;
    });

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

  const handleRepresentativeSign = () => {
    if (!registration.representativeSignature) {
      const isConfirmed = window.confirm(
        "서약의 내용을 모두 확인했으며, 위 내용을 모두 준수할 것을 서약합니다."
      );

      if (isConfirmed) {
        setRegistration((prevState) => ({
          ...prevState,
          representativeSignature: true,
        }));
      }
    } else {
      setRegistration((prevState) => ({
        ...prevState,
        representativeSignature: false,
      }));
    }
  };

  return (
    <div className="club-registration">
      <div className="frame-3">
        <UpperBar
          title={
            type === "promotional"
              ? "동아리 신규등록 신청"
              : type === "renewal"
              ? "동아리 재등록 신청"
              : "동아리 가등록 신청"
          }
          className={"upper-bar"}
        />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="동아리 정보" />
              <div className="frame-9">
                {(type === "promotional" || type === "renewal") && (
                  <p className="div-2">
                    <span className="span">이전 동아리명: </span>
                    <input
                      type="text"
                      name="prevName"
                      value={registration.prevName}
                      onChange={noChange}
                      placeholder="동아리명을 입력하세요."
                      className="text-wrapper-8"
                      style={{ width: "880px" }}
                    />
                  </p>
                )}

                <p className="div-2">
                  <span className="span">신규 동아리명: </span>
                  <input
                    type="text"
                    name="currentName"
                    value={registration.currentName}
                    onChange={handleChange}
                    placeholder="동아리명을 입력하세요."
                    className="text-wrapper-8"
                    style={{ width: "880px" }}
                  />
                </p>
                <p className="div-2">
                  <span className="span">대표자 전화번호: </span>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={registration.phoneNumber}
                    onChange={handleChange}
                    placeholder="010-xxxx-xxxx"
                    className="text-wrapper-8"
                    style={{ width: "862px" }}
                  />
                </p>
                <p className="div-3">
                  <span className="span">설립 연도:</span>
                  <input
                    type="number"
                    name="foundingYear"
                    value={registration.foundingYear}
                    onChange={handleChange}
                    placeholder="설립 연도"
                    className="text-wrapper-8"
                  />
                </p>
                {type === "provisional" && (
                  <p className="div-3">
                    <span className="span">설립 월:</span>
                    <input
                      type="number"
                      name="foundingMonth"
                      value={registration.foundingMonth}
                      onChange={handleChange}
                      placeholder="설립 월"
                      className="text-wrapper-8"
                    />
                  </p>
                )}
                <p className="div-3">
                  <div className="dropdown-container">
                    <label className="span" htmlFor="activity-type">
                      소속/희망 분과:
                    </label>
                    <select
                      name="division"
                      id="activity-type"
                      value={registration.division}
                      onChange={handleChange}
                      className="text-wrapper-8"
                    >
                      <option value="-1">분과 선택...</option>
                      <option value="1">생활문화</option>
                      <option value="2">연행예술</option>
                      <option value="3">전시창작</option>
                      <option value="4">밴드음악</option>
                      <option value="5">보컬음악</option>
                      <option value="6">연주음악</option>
                      <option value="7">사회</option>
                      <option value="8">종교</option>
                      <option value="9">구기체육</option>
                      <option value="10">생활체육</option>
                      <option value="11">이공학술</option>
                      <option value="12">인문학술</option>
                    </select>
                  </div>
                </p>
              </div>
            </div>
            {(type === "promotional" || type === "renewal") &&
              !registration.isSelectiveAdvisor && (
                <div className="frame-8">
                  <SubTitle
                    className="sub-title-instance"
                    text="지도교수 정보"
                  />
                  <div className="frame-9">
                    {/* <p className="div-3">
                    <input
                      type="checkbox"
                      name="isAdvisor"
                      checked={registration.isSelectiveAdvisor}
                      onChange={handleChange}
                      className="check-box"
                    />
                    <span className="span">
                      지도교수 없음 (기존에 선택적 교수를 신청했던 동아리만
                      가능합니다.)
                    </span>
                  </p> */}

                    <p className="div-3">
                      <span className="span">성함: </span>
                      <input
                        type="text"
                        name="advisorName"
                        value={registration.advisorName}
                        onChange={handleChange}
                        placeholder="지도교수 성함을 입력하세요."
                        className="text-wrapper-8"
                        style={{ width: "954px" }}
                      />
                    </p>
                    <p className="div-3">
                      <span className="span">카이스트 이메일: </span>
                      <input
                        type="text"
                        name="advisorEmail"
                        value={registration.advisorEmail}
                        onChange={handleChange}
                        placeholder="지도교수 카이스트 이메일을 입력하세요."
                        className="text-wrapper-8"
                        style={{ width: "860px" }}
                      />
                    </p>
                    <p className="div-3">
                      <div className="dropdown-container">
                        <label className="span" htmlFor="activity-type">
                          직급:
                        </label>
                        <select
                          name="advisorLevel"
                          id="activity-type"
                          value={registration.advisorLevel}
                          onChange={handleChange}
                          className="text-wrapper-8"
                        >
                          <option value="-1">직급 선택...</option>
                          <option value="1">정교수</option>
                          <option value="2">부교수</option>
                          <option value="3">조교수</option>
                        </select>
                      </div>
                    </p>
                  </div>
                </div>
              )}
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="활동분야" />
              <div className="frame-9">
                <p className="div-3">
                  <span className="span">국문: </span>
                  <input
                    type="text"
                    name="characteristicKr"
                    value={registration.characteristicKr}
                    onChange={handleChange}
                    placeholder="활동분야를 입력하세요."
                    className="text-wrapper-8"
                    style={{ width: "954px" }}
                  />
                </p>
                <p className="div-3">
                  <span className="span">영문: </span>
                  <input
                    type="text"
                    name="characteristicEn"
                    value={registration.characteristicEn}
                    onChange={handleChange}
                    placeholder="활동분야를 입력하세요."
                    className="text-wrapper-8"
                    style={{ width: "954px" }}
                  />
                </p>
              </div>
            </div>

            <div className="frame-11">
              <SubTitle text="분과 정합성" />
              <div className="frame-9">
                <textarea
                  name="divisionConsistency"
                  value={registration.divisionConsistency}
                  onChange={handleChange}
                  placeholder="분과 정합성을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "150px" }}
                />
              </div>
            </div>
            <div className="frame-11">
              <SubTitle text="설립 목적" />
              <div className="frame-9">
                <textarea
                  name="purpose"
                  value={registration.purpose}
                  onChange={handleChange}
                  placeholder="설립 목적을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "150px" }}
                />
              </div>
            </div>
            <div className="frame-11">
              <SubTitle text="주요 활동계획" />
              <div className="frame-9">
                <textarea
                  name="mainPlan"
                  value={registration.mainPlan}
                  onChange={handleChange}
                  placeholder="주요 활동계획을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "300px" }}
                />
              </div>
            </div>
            {type === "promotional" && (
              <div className="frame-11">
                <SubTitle
                  className="sub-title-instance"
                  divClassName="design-component-instance-node"
                  text={`가등록/등록취소 기간 활동 보고서`}
                />
                <div className="frame-9">
                  <div>
                    <Activity
                      property1="variant-2"
                      activityStateProperty1={2}
                      id={0}
                    />
                    {Array.isArray(registration.activityReport) &&
                      registration.activityReport.map((activity, index) => (
                        <Activity
                          isRegistration={1}
                          key={index}
                          index={index + 1}
                          name={activity.title}
                          type={activity.activityType}
                          start_date={activity.startDate}
                          end_date={activity.endDate}
                          activityStateProperty1={activity.feedbackType}
                          id={activity.id}
                        />
                      ))}
                  </div>
                </div>
                <div className="frame-28">
                  {registration.activityReport?.length < 20 &&
                    typeId < 4 &&
                    durationStatus == 1 && (
                      <>
                        <div
                          className="add-activity-button"
                          onClick={() =>
                            navigate("/club_registration/add_activity")
                          }
                          style={{ cursor: "pointer" }}
                        />

                        <div
                          className="frame-29"
                          onClick={() =>
                            navigate("/club_registration/add_activity")
                          }
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
                      </>
                    )}
                </div>
              </div>
            )}
            {(type === "promotional" || type === "provisional") && (
              <div className="frame-11">
                <SubTitle text="활동 계획서" />

                <div className="frame-9">
                  <p className="div-3">
                    <span className="span-notice">
                      * 활동 목적 및 대중사업 계획을 포함한 활동 계획서 1부 제출
                    </span>
                  </p>
                  <p className="div-3">
                    <span className="span-notice">
                      * 활동마다 활동명, 활동 기간, 활동 내용, 운영 예산을
                      포함한 자유 양식으로 제출
                    </span>
                  </p>
                  <div className="div-3">
                    <a
                      href="https://ar-002-clubs.s3.ap-northeast-2.amazonaws.com/uploads/2024-03-02T05-03-16.387Z_%5B%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%A3%C3%A1%C2%86%C2%BC%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%B5%C3%A1%C2%86%C2%A8%5D%20%C3%A1%C2%84%C2%92%C3%A1%C2%85%C2%AA%C3%A1%C2%86%C2%AF%C3%A1%C2%84%C2%83%C3%A1%C2%85%C2%A9%C3%A1%C2%86%C2%BC%20%C3%A1%C2%84%C2%80%C3%A1%C2%85%C2%A8%C3%A1%C2%84%C2%92%C3%A1%C2%85%C2%AC%C3%A1%C2%86%C2%A8%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%A5.docx"
                      download="[양식] 활동 계획서.docx"
                      className="span-notice"
                    >
                      양식 다운로드
                    </a>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "activityPlan");
                      }
                    }}
                  />
                  {groupProofImagesInPairs("activityPlan").map(
                    (pair, pairIndex) => (
                      <div key={pairIndex} className="frame-13">
                        {pair.map((image, index) => (
                          <ActivityProof
                            key={index}
                            url={image.imageUrl}
                            className="activity-proof-instance"
                            property1="default"
                            fileName={image.fileName}
                            onDelete={() =>
                              handleDeleteImage(image.fileName, "activityPlan")
                            }
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {type === "promotional" && (
              <div className="frame-11">
                <SubTitle text="동아리 회칙" />
                <div className="frame-9">
                  <p className="div-3">
                    <span className="span-notice">* 동아리 회칙 작성</span>
                  </p>
                  <div className="div-3">
                    <a
                      href="https://ar-002-clubs.s3.ap-northeast-2.amazonaws.com/uploads/2024-03-02T05-03-21.907Z_%5B%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%A3%C3%A1%C2%86%C2%BC%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%B5%C3%A1%C2%86%C2%A8%5D%20%C3%A1%C2%84%C2%83%C3%A1%C2%85%C2%A9%C3%A1%C2%86%C2%BC%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%A1%C3%A1%C2%84%C2%85%C3%A1%C2%85%C2%B5%20%C3%A1%C2%84%C2%92%C3%A1%C2%85%C2%AC%C3%A1%C2%84%C2%8E%C3%A1%C2%85%C2%B5%C3%A1%C2%86%C2%A8%20%C3%A1%C2%84%C2%90%C3%A1%C2%85%C2%A6%C3%A1%C2%86%C2%B7%C3%A1%C2%84%C2%91%C3%A1%C2%85%C2%B3%C3%A1%C2%86%C2%AF%C3%A1%C2%84%C2%85%C3%A1%C2%85%C2%B5%C3%A1%C2%86%C2%BA.docx"
                      download="[양식] 동아리 회칙.docx"
                      className="span-notice"
                    >
                      양식 다운로드
                    </a>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "regulation");
                      }
                    }}
                  />
                  {groupProofImagesInPairs("regulation").map(
                    (pair, pairIndex) => (
                      <div key={pairIndex} className="frame-13">
                        {pair.map((image, index) => (
                          <ActivityProof
                            key={index}
                            url={image.imageUrl}
                            className="activity-proof-instance"
                            property1="default"
                            fileName={image.fileName}
                            onDelete={() =>
                              handleDeleteImage(image.fileName, "regulation")
                            }
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {(type === "promotional" || type === "renewal") && (
              <div className="frame-11">
                <SubTitle text="외부강사 지도계획서" />

                <div className="frame-9">
                  <p className="div-3">
                    <span className="span-notice">
                      * (선택) 외부강사가 직접 작성하여 제출
                    </span>
                  </p>
                  <div className="div-3">
                    <a
                      href="https://ar-002-clubs.s3.ap-northeast-2.amazonaws.com/uploads/2024-03-02T05-03-19.060Z_%5B%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%A3%C3%A1%C2%86%C2%BC%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%B5%C3%A1%C2%86%C2%A8%5D%20%C3%A1%C2%84%C2%92%C3%A1%C2%85%C2%A1%C3%A1%C2%86%C2%A8%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%A2%C3%A1%C2%86%C2%BC%20%C3%A1%C2%84%C2%8C%C3%A1%C2%85%C2%B5%C3%A1%C2%84%C2%83%C3%A1%C2%85%C2%A9%C3%A1%C2%84%C2%80%C3%A1%C2%85%C2%A8%C3%A1%C2%84%C2%92%C3%A1%C2%85%C2%AC%C3%A1%C2%86%C2%A8%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%A5%28%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%AC%C3%A1%C2%84%C2%87%C3%A1%C2%85%C2%AE%C3%A1%C2%84%C2%80%C3%A1%C2%85%C2%A1%C3%A1%C2%86%C2%BC%C3%A1%C2%84%C2%89%C3%A1%C2%85%C2%A1%C3%A1%C2%84%C2%8B%C3%A1%C2%85%C2%AD%C3%A1%C2%86%C2%BC%29.docx"
                      download="[양식] 학생 지도계획서(외부강사용).docx"
                      className="span-notice"
                    >
                      양식 다운로드
                    </a>
                  </div>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileUpload(e.target.files[0], "externalTeacher");
                      }
                    }}
                  />
                  {groupProofImagesInPairs("externalTeacher").map(
                    (pair, pairIndex) => (
                      <div key={pairIndex} className="frame-13">
                        {pair.map((image, index) => (
                          <ActivityProof
                            key={index}
                            url={image.imageUrl}
                            className="activity-proof-instance"
                            property1="default"
                            fileName={image.fileName}
                            onDelete={() =>
                              handleDeleteImage(
                                image.fileName,
                                "externalTeacher"
                              )
                            }
                          />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
            {(type === "promotional" || type === "provisional") && (
              <div className="frame-11">
                <SubTitle text="동아리연합회칙 준수 서약서" />

                <div className="frame-9">
                  <p className="div-3">
                    <span className="span-notice">
                      1. 동아리연합회칙을 준수하겠습니다.
                    </span>
                  </p>

                  <p className="div-3">
                    <span className="span-notice">
                      2. KAIST의 대학 문화 발전을 위해 이바지하겠습니다.
                    </span>
                  </p>
                  <p className="div-3">
                    <span className="span-notice">
                      3. 본 회의 민주적 의사결정에 성실히 참여하겠습니다.
                    </span>
                  </p>
                  {type === "promotional" && (
                    <p className="div-3">
                      <span className="span-notice">
                        4. 분과자치규칙을 준수하겠습니다.
                      </span>
                    </p>
                  )}
                  <p className="div-3">
                    <span className="span">
                      본 동아리는 다음을 따르고, 그러지 못할 경우 발생하는
                      불이익에 대해 책임을 질 것을 선서합니다.
                    </span>
                  </p>
                  <div
                    className="frame-20"
                    onClick={handleRepresentativeSign}
                    style={
                      !registration.representativeSignature
                        ? { cursor: "pointer" }
                        : {}
                    }
                  >
                    <div className="text-wrapper-11">
                      {registration.representativeSignature
                        ? "확인완료"
                        : "확인하기"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* {(type === "promotional" || type === "renewal") && (
              <div className="frame-11">
                {!registration.isSelectiveAdvisor && (
                  <>
                    <SubTitle text="지도교수 취임 승낙 및 지도계획서" />

                    <div className="frame-9">
                      <textarea
                        name="advisorPlan"
                        value={registration.advisorPlan}
                        onChange={handleChange}
                        placeholder="지도계획을 입력하세요."
                        className="text-wrapper-10"
                        style={{ height: "300px" }}
                      />
                      <p className="div-3">
                        <span className="span">
                          본인은 동아리가 작성한 등록 신청서의 내용을 모두
                          확인하였으며, 위 학생단체의 지도교수로 취임할 것을
                          승낙합니다.
                        </span>
                      </p>
                      <div className="frame-20">
                        <div className="text-wrapper-11">
                          {registration.advisorSignature
                            ? "확인완료"
                            : "확인하기"}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )} */}
            <div className="frame-14">
              <div
                className="frame-15"
                onClick={handleSubmit}
                style={{ cursor: "pointer" }}
              >
                <div className="text-wrapper-11">신청 저장</div>
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
