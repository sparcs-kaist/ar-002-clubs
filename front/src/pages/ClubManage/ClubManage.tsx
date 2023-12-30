import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { Activity } from "components/Activity";
import { ActivityState } from "components/ActivityState";
import { SubTitle } from "components/SubTitle";
import { UnderBar } from "components/UnderBar";
import { UpperBar } from "components/UpperBar";
import "./ClubManage.css";
import { getRequest, postRequest } from "utils/api";
import { useReportDurationStatus } from "hooks/useReportDurationStatus";

type Representative = {
  student_id: number;
  name: string;
};

type ClubInfo = {
  clubId: number;
  clubName: string;
  description: string;
  representatives: Representative[];
  advisor: string;
};

type ActivityInfo = {
  id: number;
  title: string;
  activityType: string;
  startDate: string;
  endDate: string;
  feedbackType: number;
};

export const ClubManage = (): JSX.Element => {
  const userRepresentativeStatuses = useUserRepresentativeStatus(); // 배열을 반환한다고 가정
  const { durationStatus } = useReportDurationStatus();
  const navigate = useNavigate();
  const [clubInfos, setClubInfos] = useState<{ [key: number]: ClubInfo }>({});
  const [advisorSignedStatus, setAdvisorSignedStatus] = useState<{
    [key: number]: boolean;
  }>({});
  const [activitiesLists, setActivitiesLists] = useState<{
    [key: number]: ActivityInfo[];
  }>({});
  const [memberLists, setMemberLists] = useState<{ [key: number]: string[] }>(
    {}
  );
  const [loadedClubIds, setLoadedClubIds] = useState<number[]>([]);

  useEffect(() => {
    userRepresentativeStatuses.userStatuses.forEach((status) => {
      const { clubId } = status;
      // 이미 로드된 clubId의 데이터는 다시 요청하지 않도록 함
      if (loadedClubIds.includes(clubId)) {
        return;
      }
      // 이미 로드된 clubId가 아니면 요청을 보냄
      const fetchClubMembers = async () => {
        getRequest(
          `club/club_members/${clubId}`,
          (data) => {
            setMemberLists((prevMemberLists) => ({
              ...prevMemberLists,
              [status.clubId]: data.map(
                (member: { student_id: any; name: any }) =>
                  `${member.student_id} ${member.name}`
              ),
            }));
            // 현재 로드된 clubId 목록에 추가
            setLoadedClubIds((prevIds) => [...prevIds, status.clubId]);
          },
          (error) => {
            console.error("Error fetching club members:", error);
          }
        );
      };
      const fetchActivities = async () => {
        await getRequest(
          `activity/activity_list?club_id=${clubId}`,
          (data) => {
            console.log(data);
            setActivitiesLists((activitiesLists) => ({
              ...activitiesLists,
              [clubId]: data.activities,
            }));
          },
          (error) => {
            console.error("Error fetching activities:", error);
          }
        );
      };
      const fetchClubInfo = async () => {
        await getRequest(
          `club/club_manage/?club_id=${status.clubId}`,
          (data) => {
            setClubInfos((clubInfos) => ({
              ...clubInfos,
              [status.clubId]: {
                clubId: status.clubId,
                clubName: data.data.clubName,
                description: data.data.description,
                representatives: data.data.representatives,
                advisor: data.data.advisor,
                sign: false,
              },
            }));
            fetchActivities(); // Fetch activities after setting club info
          },
          (error) => {
            console.error("Error fetching club info:", error);
          }
        );
      };
      fetchClubMembers();
      fetchClubInfo();
      setLoadedClubIds((prevIds) => [...prevIds, clubId]);
    });
  }, [userRepresentativeStatuses, clubInfos, loadedClubIds]);

  const handleDropdownChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number,
    clubId: number
  ) => {
    const selectedMemberInfo = event.target.value.split(" ");
    const next_student_id = selectedMemberInfo[0];
    const prev_student_id = clubInfos[clubId].representatives[index].student_id;
    const rep_id = index + 1;

    if (
      window.confirm(
        `${
          index == 0 ? "대표자를" : "대의원을"
        } ${event.target.value.trim()}(으)로 변경하시겠습니까?`
      )
    ) {
      try {
        await postRequest(
          "club/update_representatives",
          {
            prev_student_id,
            next_student_id,
            rep_id,
            club_id: clubInfos[clubId].clubId,
          },
          () => {
            window.location.reload(); // 페이지 새로고침
          },
          (error) => {
            alert("대표자/대의원 변경에 실패했습니다. 다시 시도해주세요.");
            console.error("Error updating representative:", error);
          }
        );
      } catch (error) {
        console.error("Error sending update request:", error);
      }
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    clubId: number
  ) => {
    setClubInfos({
      ...clubInfos,
      [clubId]: {
        ...clubInfos[clubId],
        description: event.target.value,
      },
    });
  };

  const handleSaveDescription = async (clubId: number) => {
    try {
      const dataToSend = {
        clubId: clubId,
        description: clubInfos[clubId].description,
      };
      await postRequest(
        "club/updateDescription",
        dataToSend,
        () => {
          alert("설명이 저장되었습니다.");
          // Optionally, show a success message
        },
        (error) => {
          console.error("Error updating description:", error);
          // Optionally, handle the error (e.g., show error message)
        }
      );
    } catch (error) {
      console.error("Error sending update request:", error);
    }
  };

  const handleAdvisorSign = async (
    clubId: number,
    typeId: number,
    clubName: string
  ) => {
    if (typeId !== 4) {
      alert("접근 권한이 없습니다. 지도교수만 접근 가능합니다.");
      return;
    }

    const confirmSign = window.confirm(
      `지도교수로서 해당 기간 중 ${clubName}의 동아리 활동이 활동보고서와 일치함을 확인하고 이에 서명합니다.`
    );
    if (!confirmSign) {
      return; // If not confirmed, exit the function
    }

    try {
      // Sign request
      await postRequest(
        "activity/advisor_sign",
        { clubId },
        () => {
          checkAdvisorSignStatus(clubId); // Update sign status after signing
          alert("서명이 완료되었습니다.");
        },
        (error) => {
          console.error("Error signing:", error);
        }
      );
    } catch (error) {
      console.error("Error sending sign request:", error);
    }
  };

  const checkAdvisorSignStatus = async (clubId: number) => {
    await getRequest(
      `activity/advisor_sign?club_id=${clubId}`,
      (data) => {
        setAdvisorSignedStatus((prevStatus) => ({
          ...prevStatus,
          [clubId]: data.signed,
        }));
      },
      (error) => {
        console.error("Error fetching sign status:", error);
      }
    );
  };

  useEffect(() => {
    userRepresentativeStatuses.userStatuses.forEach((status) => {
      const { clubId } = status;
      if (loadedClubIds.includes(clubId)) {
        return;
      }
      // existing code for fetching club members and club info
      checkAdvisorSignStatus(clubId); // Check advisor sign status for each club
      setLoadedClubIds((prevIds) => [...prevIds, clubId]);
    });
  }, [userRepresentativeStatuses, loadedClubIds]);

  return (
    <div className="club-manage">
      <div className="frame-8">
        <UpperBar title={`동아리 관리`} className="upper-bar" />
        <div className="frame-wrapper">
          {userRepresentativeStatuses.userStatuses.map((status, index) => {
            const currentClubInfo = clubInfos[status.clubId];
            if (!currentClubInfo) {
              // Data for this clubId has not been loaded yet
              return null; // or you can return a loader, placeholder, etc.
            }

            return (
              <div key={index} className="frame-12">
                {status.typeId === 1 && (
                  <div className="frame-13">
                    <SubTitle
                      className="sub-title-instance"
                      divClassName="design-component-instance-node"
                      text={`${currentClubInfo.clubName} 대의원 변경`}
                    />
                    <div className="frame-14">
                      {clubInfos[status.clubId]?.representatives?.map(
                        (rep, index) => (
                          <div key={index} className="overlap-group-wrapper">
                            <div className="overlap-group">
                              <p className="p">
                                <span className="span">
                                  {index === 0 ? "대표자 :" : "대의원 :"}
                                </span>
                                <span className="text-wrapper-9">&nbsp;</span>
                              </p>
                              <select
                                className="frame-15 text-wrapper-8"
                                value=""
                                onChange={(e) =>
                                  handleDropdownChange(e, index, status.clubId)
                                }
                              >
                                <option value="">
                                  {rep.student_id > 0
                                    ? `${rep.student_id} ${rep.name}`
                                    : "없음"}
                                </option>
                                {memberLists[status.clubId]?.map(
                                  (member, memberIdx) => (
                                    <option key={memberIdx} value={member}>
                                      {member}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {status.typeId < 4 && (
                  <div className="frame-16">
                    <SubTitle
                      className="sub-title-instance"
                      divClassName="design-component-instance-node"
                      text={`${currentClubInfo.clubName} 설명 변경`}
                    />
                    <div className="frame-17">
                      <textarea
                        className="frame-18"
                        value={currentClubInfo.description}
                        onChange={(e) =>
                          handleDescriptionChange(e, status.clubId)
                        }
                      />
                    </div>
                    <div className="frame-19">
                      <div
                        className="frame-20"
                        onClick={() => handleSaveDescription(status.clubId)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="text-wrapper-11">설명 저장</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="frame-16">
                  {durationStatus > 0 && (
                    <div className="frame-21" style={{ marginBottom: "80px" }}>
                      <div className="frame-13">
                        <SubTitle
                          className="sub-title-instance"
                          divClassName="design-component-instance-node"
                          text={`${currentClubInfo.clubName} 활동 보고서`}
                        />
                        <div className="frame-22">
                          <Activity
                            property1="variant-2"
                            activityStateProperty1={2}
                            id={0}
                          />
                          {activitiesLists[status.clubId]?.map(
                            (activity, index) => (
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
                            )
                          )}
                        </div>
                        <div className="frame-28">
                          {activitiesLists[status.clubId]?.length < 20 &&
                            status.typeId < 4 &&
                            durationStatus == 1 && (
                              <>
                                <div
                                  className="rectangle"
                                  onClick={() => navigate("/add_activity")}
                                  style={{ cursor: "pointer" }}
                                />

                                <div
                                  className="frame-29"
                                  onClick={() => navigate("/add_activity")}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="group-3">
                                    <div className="overlap-group-2">
                                      <div className="ellipse" />
                                      <div className="text-wrapper-13">+</div>
                                    </div>
                                  </div>
                                  <div className="text-wrapper-14">
                                    활동 추가하기
                                  </div>
                                </div>
                              </>
                            )}
                        </div>
                      </div>
                      {currentClubInfo.advisor && (
                        <div className="frame-13">
                          <SubTitle
                            className="sub-title-instance"
                            divClassName="design-component-instance-node"
                            text={`${currentClubInfo.clubName} 지도교수 확인`}
                          />
                          <div className="frame-14">
                            <p className="text-wrapper-15">
                              2023.06.17. ~ 2023.12.15. 기간 중 <br />
                              {clubInfos[status.clubId].clubName}의 동아리
                              활동이 위 활동보고서와 일치함을 확인하고 이에
                              서명합니다.
                            </p>
                          </div>
                          <div className="frame-14">
                            <div className="frame-30">
                              <div className="text-wrapper-16">
                                지도교수: {clubInfos[status.clubId].advisor}
                              </div>
                            </div>
                            <div
                              className="group-4"
                              onClick={
                                advisorSignedStatus[status.clubId]
                                  ? () => {
                                      alert("이미 서명을 완료하였습니다.");
                                    }
                                  : () => {
                                      handleAdvisorSign(
                                        status.clubId,
                                        status.typeId,
                                        clubInfos[status.clubId].clubName
                                      );
                                    }
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <div className="frame-20">
                                <div className="text-wrapper-11">
                                  {advisorSignedStatus[status.clubId]
                                    ? "확인완료"
                                    : "확인하기"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
