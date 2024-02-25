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
import { useReportDurationStatus } from "hooks/useReportDurationStatus";
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
  foundingMonth: string;
  division: number;
  isAdvisor: boolean;
  advisorName: string;
  advisorEmail: string;
  advisorLevel: string;
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
  foundingMonth: "",
  division: 0,
  isAdvisor: false,
  advisorName: "",
  advisorEmail: "",
  advisorLevel: "",
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
  const { durationStatus } = useReportDurationStatus();
  const navigate = useNavigate();

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
    console.log(registration);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      clubId,
      // funding.name,
      // funding.expenditureDate,
      // funding.expenditureAmount,
      // funding.purpose,
      // funding.transactionImages,
      // funding.detailImages,
    ];

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
    const dataToSend = registration;

    // Success callback
    const handleSuccess = (response: any) => {
      console.log("Activity added successfully:", response);
      navigate(`/club_manage`);
      // Additional success logic here (e.g., redirecting or showing a success message)
    };

    // Error callback
    const handleError = (error: any) => {
      console.error("Error adding activity:", error);
      alert(
        "지원금을 추가하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요"
      );
      // Additional error handling logic here (e.g., showing an error message)
    };

    setRegistration(initialState);

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

  const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  const typeId = userStatuses.length > 0 ? userStatuses[0].typeId : 0;

  // useEffect{
  //   const fetchActivities = async () => {
  //     await getRequest(
  //       `activity/activity_list?club_id=${clubId}`,
  //       (data) => {
  //         setActivitiesLists((activitiesLists) => ({
  //           ...activitiesLists,
  //           [clubId]: data.activities,
  //         }));
  //       },
  //       (error) => {
  //         console.error("Error fetching activities:", error);
  //       }
  //     );
  //   };
  // }

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
                      onChange={handleChange}
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
                <p className="div-3">
                  <span className="span">설립 연월:</span>
                  <input
                    type="month"
                    name="foundingMonth"
                    value={registration.foundingMonth}
                    onChange={handleChange}
                    placeholder="설립 연월"
                    className="text-wrapper-8"
                  />
                </p>
                <p className="div-3">
                  <div className="dropdown-container">
                    <label className="span" htmlFor="activity-type">
                      소속 분과:
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
            {(type === "promotional" || type === "renewal") && (
              <div className="frame-8">
                <SubTitle className="sub-title-instance" text="지도교수 정보" />
                <div className="frame-9">
                  <p className="div-3">
                    <input
                      type="checkbox"
                      name="isAdvisor"
                      checked={registration.isAdvisor}
                      onChange={handleChange}
                      className="check-box"
                    />
                    <span className="span">
                      지도교수 없음 (기존에 선택적 교수를 신청했던 동아리만
                      가능합니다.)
                    </span>
                  </p>
                  {!registration.isAdvisor && (
                    <>
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
                            <option value="0">정교수</option>
                            <option value="1">부교수</option>
                            <option value="2">조교수</option>
                            {/* {activities.map((activity, index) => (
                        <option key={index} value={activity.id}>
                          {activity.title}
                        </option>
                      ))} */}
                          </select>
                        </div>
                      </p>
                    </>
                  )}
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
                  <Activity
                    property1="variant-2"
                    activityStateProperty1={2}
                    id={0}
                  />
                  {Array.isArray(registration.activityReport) &&
                    registration.activityReport.map((activity, index) => (
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
                    ))}
                </div>
                <div className="frame-28">
                  {registration.activityReport?.length < 20 &&
                    typeId < 4 &&
                    durationStatus == 1 && (
                      <>
                        <div
                          className="add-activity-button"
                          onClick={() =>
                            navigate("/add_club_registration/add_activity")
                          }
                          style={{ cursor: "pointer" }}
                        />

                        <div
                          className="frame-29"
                          onClick={() =>
                            navigate("/add_club_registration/add_activity")
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
                    * 활동마다 활동명, 활동 기간, 활동 내용, 운영 예산을 포함한
                    자유 양식으로 제출
                  </span>
                </p>
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
            {type === "promotional" && (
              <div className="frame-11">
                <SubTitle text="동아리 회칙" />
                <div className="frame-9">
                  <p className="div-3">
                    <span className="span-notice">* 동아리 회칙 작성</span>
                  </p>

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
                      2. 분과자치규칙을 준수하겠습니다.
                    </span>
                  </p>
                  <p className="div-3">
                    <span className="span-notice">
                      3. KAIST의 대학 문화 발전을 위해 이바지하겠습니다.
                    </span>
                  </p>
                  <p className="div-3">
                    <span className="span-notice">
                      4. 본 회의 민주적 의사결정에 성실히 참여하겠습니다.
                    </span>
                  </p>
                  <p className="div-3">
                    <span className="span">
                      본 동아리는 다음을 따르고, 그러지 못할 경우 발생하는
                      불이익에 대해 책임을 질 것을 선서합니다.
                    </span>
                  </p>
                  <div className="frame-20">
                    <div className="text-wrapper-11">
                      {registration.representativeSignature
                        ? "확인완료"
                        : "확인하기"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(type === "promotional" || type === "renewal") && (
              <div className="frame-11">
                {!registration.isAdvisor && (
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
            )}
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
