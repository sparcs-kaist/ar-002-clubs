import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/activity/ActivityProof";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./FundingAdminDetail.css";
import { UpperBar } from "components/home/UpperBar";
import { ActivityFeedback } from "components/activity/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";
import { useReportDurationStatus } from "hooks/useReportDurationStatus";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";

interface Participant {
  student_id: string;
  name: string;
}

interface ProofImage {
  imageUrl: string;
  fileName: string;
}

interface FeedbackResult {
  feedback_time: string;
  text: string;
}

interface AdditionalProof {
  isFoodExpense: boolean;
  isLaborContract: boolean;
  isExternalEventParticipationFee: boolean;
  isPublication: boolean;
  isProfitMakingActivity: boolean;
  isJointExpense: boolean;
  additionalText: string;
  additionalImages: ProofImage[];
}

interface FundingState {
  name: string;
  clubId: number;
  expenditureDate: string;
  expenditureAmount: number;
  approvedAmount: number;
  purpose: number;
  isTransportation: boolean;
  isNonCorporateTransaction: boolean;
  transactionImages: ProofImage[];
  detailImages: ProofImage[];
  additionalProof: AdditionalProof;
  fixture: FixtureState;
  transportation: TransportationState;
  nonCorp: NonCorpState;
  feedbackResults: FeedbackResult[];
  isCommittee: boolean;
}

interface FixtureState {
  type: number;
  isSoftware: boolean;
  softwareProofText: string;
  softwareProofImages: ProofImage[];
  name: string;
  fixtureType: number; // This can be an enum for different fixture types
  purpose: string;
  fixtureImages: ProofImage[];
}

interface TransportationState {
  type: number; // This can be an enum for different transportation types
  origin: string;
  destination: string;
  purpose: string;
  cargoList: string;
  participants: Participant[];
  placeValidity: string;
}

interface NonCorpState {
  traderName: string;
  traderAccountNumber: string;
  wasteExplanation: string;
}

interface Activity {
  id: string; // or number, depending on your data structure
  title: string;
}

export const FundingAdminDetail = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const navigate = useNavigate();
  const { id } = useParams();
  const [funding, setFunding] = useState<FundingState>({
    name: "",
    clubId: 0,
    expenditureDate: "",
    expenditureAmount: 0,
    approvedAmount: 0,
    purpose: -1,
    isTransportation: false,
    isNonCorporateTransaction: false,
    transactionImages: [],
    detailImages: [],
    additionalProof: {
      isFoodExpense: false,
      isLaborContract: false,
      isExternalEventParticipationFee: false,
      isPublication: false,
      isProfitMakingActivity: false,
      isJointExpense: false,
      additionalText: "",
      additionalImages: [],
    },
    fixture: {
      type: 0,
      isSoftware: false,
      softwareProofText: "",
      softwareProofImages: [],
      name: "",
      fixtureType: 0,
      purpose: "",
      fixtureImages: [],
    },
    transportation: {
      type: 0,
      origin: "",
      destination: "",
      purpose: "",
      cargoList: "",
      participants: [],
      placeValidity: "",
    },
    nonCorp: {
      traderName: "",
      traderAccountNumber: "",
      wasteExplanation: "",
    },
    isCommittee: false,
    feedbackResults: [],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [originalSearchResults, setOriginalSearchResults] = useState<
    Participant[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  // const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  const [reviewResult, setReviewResult] = useState("");

  useEffect(() => {
    const fetchFundingData = async () => {
      try {
        console.log(id);
        await getRequest(
          `funding_feedback/getFunding/${id}`,
          (data) => {
            setFunding(data.funding);
          },
          (error) => {
            console.error(error);
            alert("권한이 없습니다.");
            navigate(-1);
          }
        );
      } catch (error) {
        console.error("Error fetching activity data:", error);
      }
    };

    if (id) {
      fetchFundingData();
    }
  }, [id]);

  useEffect(() => {
    const fetchActivities = async () => {
      getRequest(
        `activity/activity_list?club_id=${funding.clubId}`,
        (data) => {
          setActivities(data.activities || []);
        },
        (error) => {
          console.error("Failed to fetch activities", error);
        }
      );
    };

    if (funding.clubId) {
      fetchActivities();
    }
  }, [funding.clubId]);

  // Validation for date range and order
  //TODO: 서버에서 불러와서 적용
  const minDate = "2023-12-16";
  const maxDate = "2024-06-14";

  // useEffect(() => {
  //   removeAllParticipants();
  //   funding.transportation.participants = [];
  //   searchMember(""); // Call this with an empty string to fetch all members initially
  // }, [clubId, funding.purpose]);

  // useEffect(() => {
  //   if (!isLoading && durationStatus != 1) {
  //     alert("활동 추가 기간이 아닙니다. 기간을 확인해주세요.");
  //     navigate(-1);
  //   }
  // }, [isLoading]);

  const handleReviewResultChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReviewResult(event.target.value);
  };

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
    if (name.includes(".")) {
      const [stateName, fieldName] = name.split(".");
      setFunding((prevState) => {
        const subState = prevState[stateName as keyof FundingState];
        if (typeof subState === "object" && subState !== null) {
          return {
            ...prevState,
            [stateName]: {
              ...subState,
              [fieldName]: inputValue,
            },
          };
        }
        return prevState;
      });
    } else {
      setFunding((prevState) => ({
        ...prevState,
        [name]: inputValue,
      }));
    }
  };

  const noChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {};

  const handleDeleteImage = async (fileName: string, imageTypePath: string) => {
    const confirmDelete = window.confirm("첨부 파일을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const pathParts = imageTypePath.split(".");

    setFunding((prevState) => {
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

  const groupProofImagesInPairs = (imageTypePath: string): ProofImage[][] => {
    const pathParts = imageTypePath.split(".");
    let current: any = funding;
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
      `funding/search_members?activity_id=${funding.purpose}&query=${query}`, // 클럽 ID와 검색 쿼리를 포함한 URL
      (data) => {
        const newSearchResults = data.members.filter(
          (member: Participant) =>
            !funding.transportation.participants.some(
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
    setFunding((prevState) => ({
      ...prevState,
      transportation: {
        ...prevState.transportation,
        participants: [...prevState.transportation.participants, participant],
      },
    }));

    // Remove added participant from search results
    const updatedSearchResults = searchResults.filter(
      (member) => member.student_id !== participant.student_id
    );
    setSearchResults(updatedSearchResults);
  };

  const removeParticipant = (index: number) => {
    setFunding((prevState) => {
      const newParticipants = [...prevState.transportation.participants];
      newParticipants.splice(index, 1);

      return {
        ...prevState,
        transportation: {
          ...prevState.transportation,
          participants: newParticipants,
        },
      };
    });

    // If removed participant was originally in the search results, add them back
    const removedParticipant = funding.transportation.participants[index];
    if (
      originalSearchResults.some(
        (member) => member.student_id === removedParticipant.student_id
      )
    ) {
      setSearchResults([...searchResults, removedParticipant]);
    }
  };

  const addAllParticipants = () => {
    setFunding((prevState) => ({
      ...prevState,
      transportation: {
        ...prevState.transportation,
        participants: [
          ...prevState.transportation.participants,
          ...searchResults,
        ],
      },
    }));
    setSearchResults([]); // Clear search results after adding all to participants
  };

  const removeAllParticipants = () => {
    setFunding((prevState) => ({
      ...prevState,
      transportation: {
        ...prevState.transportation,
        participants: [],
      },
    }));
    setSearchResults(originalSearchResults); // Reset search results to original state
  };

  const renderParticipants = () => {
    return funding.transportation.participants.map((participant, index) => (
      <span
        key={index}
        className="participant-tag"
        style={{ fontSize: "20px", width: "1000px" }}
      >
        {participant.name},
      </span>
    ));
  };

  const handleReviewComplete = async () => {
    try {
      if (
        funding.approvedAmount >= 0 &&
        funding.approvedAmount <= funding.expenditureAmount
      ) {
        await postRequest(
          "funding_feedback/feedback",
          {
            funding_id: id,
            reviewResult: reviewResult,
            funding: funding,
          },
          () => navigate(-1)
        );
      } else {
        alert("승인 금액이 범위 밖에 있습니다. 다시 확인해주세요.");
      }
    } catch (error) {
      console.error("Failed to post review:", error);
    }
  };

  const renderActivityFeedback = () => {
    return funding.feedbackResults.map((feedback, index) => (
      <ActivityFeedback
        key={index}
        text={feedback.feedback_time}
        text1={feedback.text}
      />
    ));
  };

  return (
    <div className="add-funding">
      <div className="frame-3">
        <UpperBar title={funding.name} className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              <SubTitle className="sub-title-instance" text="지원금 정보" />
              <div className="frame-9">
                <p className="div-3">
                  <span className="span">지출 일자:</span>
                  <input
                    type="date"
                    name="expenditureDate"
                    value={funding.expenditureDate}
                    onChange={noChange}
                    placeholder="지출 일자"
                    className="text-wrapper-8"
                  />
                </p>
                <p className="div-3">
                  <span className="span">지출 금액:</span>
                  <input
                    type="number"
                    name="expenditureAmount"
                    value={funding.expenditureAmount}
                    onChange={noChange}
                    placeholder="지출 금액"
                    className="text-wrapper-8"
                  />
                  <span className="span">원</span>
                </p>
                <p className="div-3">
                  <div className="dropdown-container">
                    <label className="span" htmlFor="activity-type">
                      지출 목적:
                    </label>
                    <select
                      name="purpose"
                      id="activity-type"
                      value={funding.purpose}
                      onChange={noChange}
                      className="text-wrapper-8"
                    >
                      <option value="-1">분류 선택...</option>
                      <option value="0">
                        비품 및 활동보고서로 증빙이 불가한 물품
                      </option>
                      {activities.map((activity, index) => (
                        <option key={index} value={activity.id}>
                          {activity.title}
                        </option>
                      ))}
                    </select>
                    {funding.purpose > 0 && (
                      <button
                        className="div-3"
                        style={{ marginLeft: "10px" }}
                        onClick={() =>
                          window.open(
                            `/admin/activity/${funding.purpose}`,
                            "_blank"
                          )
                        }
                      >
                        활동 바로가기
                      </button>
                    )}
                  </div>
                </p>
                <p className="div-3">
                  <span className="span">교통비 여부</span>
                  <input
                    type="checkbox"
                    name="isTransportation"
                    checked={funding.isTransportation}
                    onChange={noChange}
                    className="check-box"
                  />
                </p>
                <p className="div-3">
                  <span className="span">비법인 거래 여부</span>
                  <input
                    type="checkbox"
                    name="isNonCorporateTransaction"
                    checked={funding.isNonCorporateTransaction}
                    onChange={noChange}
                    className="check-box"
                  />
                </p>
              </div>
            </div>
            <div className="frame-12">
              <SubTitle className="sub-title-instance" text="거래 사실 증빙" />
              {/* <div className="frame-9">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "transactionImages");
                    }
                  }}
                />
              </div> */}
              <div className="frame-9">
                {groupProofImagesInPairs("transactionImages").map(
                  (pair, pairIndex) => (
                    <div key={pairIndex} className="frame-13">
                      {pair.map((image, index) => (
                        <ActivityProof
                          key={index}
                          url={image.imageUrl}
                          className="activity-proof-instance"
                          property1="variant-2"
                          fileName={image.fileName}
                          onDelete={() =>
                            handleDeleteImage(
                              image.fileName,
                              "transactionImages"
                            )
                          }
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="frame-12">
              <SubTitle
                className="sub-title-instance"
                text="거래 세부항목 증빙"
              />
              {/* <div className="frame-9">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0], "detailImages");
                    }
                  }}
                />
              </div> */}
              <div className="frame-9">
                {groupProofImagesInPairs("detailImages").map(
                  (pair, pairIndex) => (
                    <div key={pairIndex} className="frame-13">
                      {pair.map((image, index) => (
                        <ActivityProof
                          key={index}
                          url={image.imageUrl}
                          className="activity-proof-instance"
                          property1="variant-2"
                          fileName={image.fileName}
                          onDelete={() =>
                            handleDeleteImage(image.fileName, "detailImages")
                          }
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="frame-12">
              <SubTitle className="sub-title-instance" text="추가 증빙" />
              <div className="frame-9">
                <p className="div-3">
                  <span className="span">식비</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isFoodExpense"
                    checked={funding.additionalProof.isFoodExpense}
                    onChange={noChange}
                    className="check-box"
                  />
                  <span className="span">근로 계약</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isLaborContract"
                    checked={funding.additionalProof.isLaborContract}
                    onChange={noChange}
                    className="check-box"
                  />
                  <span className="span">외부 행사 참가비</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isExternalEventParticipationFee"
                    checked={
                      funding.additionalProof.isExternalEventParticipationFee
                    }
                    onChange={noChange}
                    className="check-box"
                  />
                  <span className="span">발간물</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isPublication"
                    checked={funding.additionalProof.isPublication}
                    onChange={noChange}
                    className="check-box"
                  />
                  <span className="span">수익 사업</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isProfitMakingActivity"
                    checked={funding.additionalProof.isProfitMakingActivity}
                    onChange={noChange}
                    className="check-box"
                  />
                  <span className="span">공동 경비</span>
                  <input
                    type="checkbox"
                    name="additionalProof.isJointExpense"
                    checked={funding.additionalProof.isJointExpense}
                    onChange={noChange}
                    className="check-box"
                  />
                </p>
                {funding.isNonCorporateTransaction && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 비법인 거래에서 거래 계약서 추가 증빙 필요
                    </span>
                  </p>
                )}
                {funding.isNonCorporateTransaction && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 동아리 간 비법인 거래에서 분과학생회장의 입회 하에
                      진행되었다는 증빙 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isFoodExpense && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 합치하는 외부 활동에서 교내 구성원에게 제공한 음식은
                      명단 증빙 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isFoodExpense && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 합치하는 활동에서 필수적인 식음료는 활동 규모를 알 수
                      있는 사진 등의 소명 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isLaborContract && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 근로 계약은 계좌 이체를 제외한 현금 거래 불허, 근로
                      계약서 필요 강사/연사는 이력서&지도계획서&사진 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isExternalEventParticipationFee && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 외부 행사의 참가비는 사진 및 참여 명단 증빙 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isPublication && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 발간물은 발간 주체 및 목적 작성 필요, 오프라인으로 사본
                      제출 필수
                    </span>
                  </p>
                )}
                {funding.additionalProof.isProfitMakingActivity && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 수익 사업은 결산 및 행사규모를 증명할 수 있는 자료 필요
                    </span>
                  </p>
                )}
                {funding.additionalProof.isJointExpense && (
                  <p className="div-3">
                    <span className="span-notice">
                      * 공동 경비는 한 동아리가 증빙하면 다른 동아리들은 이를
                      언급하는 것으로 충분하며, 승인 금액은 동등 분배
                    </span>
                  </p>
                )}
                <textarea
                  name="additionalProof.additionalText"
                  value={funding.additionalProof.additionalText}
                  onChange={noChange}
                  placeholder="추가 증빙을 입력하세요."
                  className="text-wrapper-10"
                  style={{ height: "150px" }}
                />
                {/* <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(
                        e.target.files[0],
                        "additionalProof.additionalImages"
                      );
                    }
                  }}
                /> */}
              </div>
              <div className="frame-9">
                {groupProofImagesInPairs(
                  "additionalProof.additionalImages"
                ).map((pair, pairIndex) => (
                  <div key={pairIndex} className="frame-13">
                    {pair.map((image, index) => (
                      <ActivityProof
                        key={index}
                        url={image.imageUrl}
                        className="activity-proof-instance"
                        property1="variant-2"
                        fileName={image.fileName}
                        onDelete={() =>
                          handleDeleteImage(
                            image.fileName,
                            "additionalProof.additionalImages"
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {funding.purpose == 0 && (
              <div className="frame-10">
                <SubTitle className="sub-title-instance" text="비품 증빙" />
                <div className="frame-9">
                  <p className="div-3">
                    <div className="dropdown-container">
                      <label className="span" htmlFor="activity-type">
                        증빙 분류:
                      </label>
                      <select
                        name="fixture.type"
                        id="activity-type"
                        value={funding.fixture.type}
                        onChange={noChange}
                        className="text-wrapper-8"
                      >
                        <option value="0">분류 선택...</option>
                        <option value="1">비품 구매</option>
                        <option value="2">비품 관리</option>
                        <option value="3">비품이 아닌 동아리 물품 구매</option>
                        <option value="4">비품이 아닌 동아리 물품 관리</option>
                      </select>
                    </div>
                  </p>
                  <p className="div-3">
                    <span className="span">소프트웨어 여부</span>
                    <input
                      type="checkbox"
                      name="fixture.isSoftware"
                      checked={funding.fixture.isSoftware}
                      onChange={noChange}
                      className="check-box"
                    />
                  </p>
                  {funding.fixture.isSoftware && (
                    <>
                      <p className="div-3">
                        <span className="span">소프트웨어 증빙</span>
                      </p>
                      <p className="div-3">
                        <span className="span-notice">
                          * 동아리 성격에 합치하는 활동에 사용하는
                          소프트웨어라는 소명
                        </span>
                      </p>
                      <p className="div-3">
                        <span className="span-notice">
                          * 정식 라이센스를 통해서 다운로드하였다는 증빙
                        </span>
                      </p>
                      <p className="div-3">
                        <span className="span-notice">
                          * 소프트웨어가 동아리 계정 또는 동아리 소유 디바이스에
                          다운로드되었다는 증빙
                        </span>
                      </p>
                      <textarea
                        name="fixture.softwareProofText"
                        value={funding.fixture.softwareProofText}
                        onChange={noChange}
                        placeholder="소프트웨어 증빙을 입력하세요."
                        className="text-wrapper-10"
                        style={{ height: "150px" }}
                      />

                      {/* <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(
                              e.target.files[0],
                              "fixture.softwareProofImages"
                            );
                          }
                        }}
                      /> */}
                      {groupProofImagesInPairs(
                        "fixture.softwareProofImages"
                      ).map((pair, pairIndex) => (
                        <div key={pairIndex} className="frame-13">
                          {pair.map((image, index) => (
                            <ActivityProof
                              key={index}
                              url={image.imageUrl}
                              className="activity-proof-instance"
                              property1="variant-2"
                              fileName={image.fileName}
                              onDelete={() =>
                                handleDeleteImage(
                                  image.fileName,
                                  "fixture.softwareProofImages"
                                )
                              }
                            />
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                  {!funding.fixture.isSoftware && (
                    <>
                      <p className="div-2">
                        <span className="span">물품명: </span>
                        <input
                          type="text"
                          name="fixture.name"
                          value={funding.fixture.name}
                          onChange={noChange}
                          placeholder="물품명을 입력하세요."
                          className="text-wrapper-8"
                          style={{ width: "942px" }}
                        />
                      </p>
                      <p className="div-3">
                        <div className="dropdown-container">
                          <label className="span" htmlFor="activity-type">
                            물품 분류:
                          </label>
                          <select
                            name="fixture.fixtureType"
                            id="activity-type"
                            value={funding.fixture.fixtureType}
                            onChange={noChange}
                            className="text-wrapper-8"
                          >
                            <option value="0">분류 선택...</option>
                            <option value="1">전자기기</option>
                            <option value="2">가구</option>
                            <option value="3">악기</option>
                            <option value="4">기타</option>
                          </select>
                        </div>
                      </p>
                      <p className="div-3">
                        <span className="span">물품 목적</span>
                      </p>
                      <textarea
                        name="fixture.purpose"
                        value={funding.fixture.purpose}
                        onChange={noChange}
                        placeholder="물품 목적을 입력하세요."
                        className="text-wrapper-10"
                        style={{ height: "150px" }}
                      />
                      <p className="div-3">
                        <span className="span">물품 사진</span>
                      </p>
                      {/* <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(
                              e.target.files[0],
                              "fixture.fixtureImages"
                            );
                          }
                        }}
                      /> */}
                      {groupProofImagesInPairs("fixture.fixtureImages").map(
                        (pair, pairIndex) => (
                          <div key={pairIndex} className="frame-13">
                            {pair.map((image, index) => (
                              <ActivityProof
                                key={index}
                                url={image.imageUrl}
                                className="activity-proof-instance"
                                property1="variant-2"
                                fileName={image.fileName}
                                onDelete={() =>
                                  handleDeleteImage(
                                    image.fileName,
                                    "fixture.fixtureImages"
                                  )
                                }
                              />
                            ))}
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            {funding.isTransportation == true && (
              <div className="frame-10">
                <SubTitle className="sub-title-instance" text="교통비 증빙" />
                <div className="frame-9">
                  <p className="div-3">
                    <div className="dropdown-container">
                      <label className="span" htmlFor="activity-type">
                        교통수단:
                      </label>
                      <select
                        name="transportation.type"
                        id="activity-type"
                        value={funding.transportation.type}
                        onChange={noChange}
                        className="text-wrapper-8"
                      >
                        <option value="0">분류 선택...</option>
                        <option value="1">시내/마을버스</option>
                        <option value="2">고속/시외버스</option>
                        <option value="3">철도</option>
                        <option value="4">택시</option>
                        <option value="5">전세버스</option>
                        <option value="6">화물 운반</option>
                        <option value="7">콜밴</option>
                        <option value="8">비행기</option>
                        <option value="9">선박</option>
                        <option value="10">기타</option>
                      </select>
                    </div>
                  </p>
                  <p className="div-2">
                    <span className="span">출발지: </span>
                    <input
                      type="text"
                      name="transportation.origin"
                      value={funding.transportation.origin}
                      onChange={noChange}
                      placeholder="출발지를 입력하세요."
                      className="text-wrapper-8"
                      style={{ width: "942px" }}
                    />
                  </p>
                  <p className="div-2">
                    <span className="span">도착지: </span>
                    <input
                      type="text"
                      name="transportation.destination"
                      value={funding.transportation.destination}
                      onChange={noChange}
                      placeholder="도착지를 입력하세요."
                      className="text-wrapper-8"
                      style={{ width: "942px" }}
                    />
                  </p>
                  <p className="div-3">
                    <span className="span">이용 목적</span>
                  </p>
                  <textarea
                    name="transportation.purpose"
                    value={funding.transportation.purpose}
                    onChange={noChange}
                    placeholder="이용 목적을 입력하세요."
                    className="text-wrapper-10"
                    style={{ height: "150px" }}
                  />
                  {(funding.transportation.type == 4 ||
                    funding.transportation.type == 5 ||
                    funding.transportation.type == 7 ||
                    funding.transportation.type == 8 ||
                    funding.transportation.type == 9 ||
                    funding.transportation.type == 10) && (
                    <>
                      <p className="div-2">
                        <span className="span">탑승자 명단:</span>
                        <span className="text-wrapper-8">
                          {" "}
                          {funding.transportation.participants.length}명
                        </span>
                      </p>
                      <div className="participants-input">
                        {renderParticipants()}
                      </div>
                    </>
                  )}
                  {(funding.transportation.type == 5 ||
                    funding.transportation.type == 6 ||
                    funding.transportation.type == 7 ||
                    funding.transportation.type == 10) && (
                    <>
                      <p className="div-3">
                        <span className="span">화물 목록</span>
                      </p>
                      <textarea
                        name="transportation.cargoList"
                        value={funding.transportation.cargoList}
                        onChange={noChange}
                        placeholder="화물 목록을 입력하세요."
                        className="text-wrapper-10"
                        style={{ height: "150px" }}
                      />
                    </>
                  )}
                  {(funding.transportation.type == 8 ||
                    funding.transportation.type == 9 ||
                    funding.transportation.type == 10) && (
                    <>
                      <p className="div-3">
                        <span className="span">행사 장소 타당성</span>
                      </p>
                      <textarea
                        name="transportation.placeValidity"
                        value={funding.transportation.placeValidity}
                        onChange={noChange}
                        placeholder="행사 장소 타당성을 입력하세요."
                        className="text-wrapper-10"
                        style={{ height: "150px" }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
            {funding.isNonCorporateTransaction == true && (
              <div className="frame-11">
                <SubTitle
                  className="sub-title-instance"
                  text="비법인 거래 증빙"
                />
                <div className="frame-9">
                  <p className="div-3">
                    <div className="dropdown-container">
                      <label className="span" htmlFor="activity-type">
                        거래자명:
                      </label>
                      <input
                        type="text"
                        name="nonCorp.traderName"
                        value={funding.nonCorp.traderName}
                        onChange={noChange}
                        placeholder="거래자명을 입력하세요."
                        className="text-wrapper-8"
                        style={{ width: "922px" }}
                      />
                    </div>
                  </p>
                  <p className="div-2">
                    <span className="span">거래자 계좌번호: </span>
                    <input
                      type="text"
                      name="nonCorp.traderAccountNumber"
                      value={funding.nonCorp.traderAccountNumber}
                      onChange={noChange}
                      placeholder="거래자 계좌번호를 입력하세요."
                      className="text-wrapper-8"
                      style={{ width: "860px" }}
                    />
                  </p>
                  <p className="div-3">
                    <span className="span">낭비가 아니라는 소명</span>
                  </p>
                  <textarea
                    name="nonCorp.wasteExplanation"
                    value={funding.nonCorp.wasteExplanation}
                    onChange={noChange}
                    placeholder="낭비가 아니라는 소명을 입력하세요."
                    className="text-wrapper-10"
                    style={{ height: "150px" }}
                  />
                </div>
              </div>
            )}
            {funding.expenditureDate >= minDate &&
              funding.expenditureDate <= maxDate && (
                <div className="frame-11">
                  <SubTitle className="sub-title-instance" text="검토 결과" />
                  <div className="frame-9">
                    <p className="div-3">
                      <span className="span">승인 금액:</span>
                      <input
                        type="number"
                        name="approvedAmount"
                        value={funding.approvedAmount}
                        onChange={handleChange}
                        placeholder="승인 금액"
                        className="text-wrapper-8"
                      />
                      <span className="span">
                        원 / {funding.expenditureAmount}원
                      </span>
                      <button
                        className="div-3"
                        style={{ marginLeft: "10px" }}
                        onClick={() => {
                          setFunding((prevState) => ({
                            ...prevState,
                            approvedAmount: prevState.expenditureAmount,
                          }));
                        }}
                      >
                        전액승인
                      </button>
                      <button
                        className="div-3"
                        style={{ marginLeft: "10px" }}
                        onClick={() => {
                          setFunding((prevState) => ({
                            ...prevState,
                            approvedAmount: 0,
                          }));
                        }}
                      >
                        미승인
                      </button>
                    </p>
                    <p className="div-3">
                      <span className="span">운영위원회 심의 필요 여부</span>
                      <input
                        type="checkbox"
                        name="isCommittee"
                        checked={funding.isCommittee}
                        onChange={handleChange}
                        className="check-box"
                      />
                    </p>
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
              )}
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
