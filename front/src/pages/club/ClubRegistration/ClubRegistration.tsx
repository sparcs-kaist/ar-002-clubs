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
import { useReportDurationStatus } from "hooks/useReportDurationStatus";

export const ClubRegistration = (): JSX.Element => {
  const { userStatuses, isLoading } = useUserRepresentativeStatus(true);
  const { durationStatus } = useReportDurationStatus();
  const navigate = useNavigate();

  const clubId = userStatuses.length > 0 ? userStatuses[0].clubId : null;
  const typeId = userStatuses.length > 0 ? userStatuses[0].typeId : 0;

  return (
    <div className="club-registration">
      <div className="frame-3">
        <UpperBar title="동아리 등록 신청" className={"upper-bar"} />
        <div className="frame-wrapper">
          <div className="frame-7">
            <div className="frame-8">
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
                      onClick={() => navigate("/club_registration_provisional")}
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
                      onClick={() => navigate("/club_registration_promotional")}
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
                    * 직전 학기에 정동아리 지위를 유지했던 동아리만 등록 가능
                  </span>
                </p>
                <div className="frame-12">
                  <div className="frame-14">
                    {typeId ? (
                      <div
                        className="frame-15"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/club_registration_renewal")}
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
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
