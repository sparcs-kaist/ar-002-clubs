import React, { useEffect, useState } from "react";
import { ActivityProof } from "components/activity/ActivityProof";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubRegistration.css";
import { UpperBar } from "components/home/UpperBar";
import { ActivityFeedback } from "components/activity/ActivityFeedback";
import { getRequest, postRequest } from "utils/api";
import { useUserRepresentativeStatus } from "hooks/useUserPermission";
import { useNavigate, useParams } from "react-router-dom";
import { useRegistrationDurationStatus } from "hooks/useReportDurationStatus";
import { Activity } from "components/activity/Activity";

interface Registration {
  id: number;
  currentName: string;
  registrationType: string;
  recentEdit: string;
  feedbackType: number;
}

export const ClubRegistration = (): JSX.Element => {
  const { userStatuses, isLoading } = useUserRepresentativeStatus(true);
  const { durationStatus } = useRegistrationDurationStatus();
  const navigate = useNavigate();

  const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  const typeId = userStatuses.length > 0 ? userStatuses[0].typeId : 0;

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isAdvisor, setIsAdvisor] = useState<Boolean>(false);

  useEffect(() => {
    const fetchAdvisorRegistrations = async () => {
      await getRequest(
        `registration/is_advisor`,
        async (data) => {
          setRegistrations(data.registrations);
          setIsAdvisor(data.isAdvisor === 1); // 이 호출은 비동기적으로 상태를 설정합니다.
          console.log(data);
          if (data.isAdvisor === 0) {
            await getRequest(
              `registration/registration_list`,
              (data) => {
                setRegistrations(data.registrations);
                console.log(data);
              },
              (error) => {
                console.error("Error fetching registrations:", error);
              }
            );
          }
        },
        (error) => {
          console.error("Error fetching advisor registrations:", error);
        }
      );
    };

    fetchAdvisorRegistrations();
  }, [clubId]); // clubId가 변경될 때만 이 useEffect를 실행합니다.

  return (
    <div className="club-registration">
      <div className="frame-3">
        <UpperBar title="동아리 등록 신청" className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
              {!isAdvisor && (
                <>
                  <SubTitle className="sub-title-instance" text="가등록" />
                  <div className="frame-9">
                    <p className="div-3">
                      <span className="span-notice">
                        * 새로 동아리를 만들려는 학부 총학생회 정회원 등록 가능
                      </span>
                    </p>
                    <p className="div-3">
                      <span className="span-notice">
                        * 직전 학기에 가등록 지위를 유지한 동아리 등록 가능
                      </span>
                    </p>
                    <div className="frame-12">
                      <div className="frame-14">
                        <div
                          className="frame-15"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate("/add_club_registration/provisional")
                          }
                        >
                          <div className="text-wrapper-11">등록 신청</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SubTitle className="sub-title-instance" text="신규등록" />
                  <div className="frame-9">
                    <p className="div-3">
                      <span className="span-notice">
                        * 2 정규학기 이상 가등록 지위를 유지한 동아리 등록 가능
                      </span>
                    </p>
                    <p className="div-3">
                      <span className="span-notice">
                        * 등록 취소된 시점 이후 3 정규학기 이상 지나지 않은 단체
                        등록 가능
                      </span>
                    </p>
                    <div className="frame-12">
                      <div className="frame-14">
                        <div
                          className="frame-15"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate("/add_club_registration/promotional")
                          }
                        >
                          <div className="text-wrapper-11">등록 신청</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SubTitle className="sub-title-instance" text="재등록" />
                  <div className="frame-9">
                    <p className="div-3">
                      <span className="span-notice">
                        * 직전 학기에 정동아리 지위를 유지했던 동아리만 등록
                        가능
                      </span>
                    </p>
                    <div className="frame-12">
                      <div className="frame-14">
                        {typeId ? (
                          <div
                            className="frame-15"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              navigate("/add_club_registration/renewal")
                            }
                          >
                            <div className="text-wrapper-11">등록 신청</div>
                          </div>
                        ) : (
                          <div className="frame-15">
                            <div className="text-wrapper-11">등록 불가</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              <SubTitle
                className="sub-title-instance"
                text={isAdvisor ? "내가 지도하는 동아리" : "내가 신청한 등록"}
              />
              <div className="frame-9">
                <div>
                  <Activity
                    property1="variant-3"
                    activityStateProperty1={2}
                    id={0}
                  />
                  {Array.isArray(registrations) &&
                    registrations.map((registration, index) => (
                      <Activity
                        isRegistration={2}
                        key={index}
                        index={index + 1}
                        name={registration.currentName}
                        type={registration.registrationType}
                        start_date={registration.recentEdit}
                        activityStateProperty1={registration.feedbackType}
                        id={registration.id}
                      />
                    ))}
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
