import React, { useEffect, useState } from "react";
import { DashboardActivity } from "components/admin/DashboardActivity";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubFundingList.css";
import { UpperBar } from "components/home/UpperBar";
import { useExecutiveStatus } from "contexts/ExecutiveStatusContext";
import { useNavigate, useParams } from "react-router-dom";
import { getRequest } from "utils/api";
import { ClubFundingElement } from "components/admin/ClubFundingList";

interface Funding {
  fundingId: number;
  name: string;
  recent_edit: string;
  recent_feedback: string;
  feedbackMemberName: string;
  executiveName: string;
  executive_id: number;
  feedbackType: number;
  expenditureAmount: number;
  approvedAmount: number;
}

export const ClubFundingList = (): JSX.Element => {
  const { executiveStatuses } = useExecutiveStatus();
  const { id } = useParams();
  const [fundings, setFundings] = useState<Funding[]>([]);
  const [clubName, setClubName] = useState("");
  const [totalExpenditureAmount, setTotalExpenditureAmount] = useState(0);
  const [totalApprovedAmount, setTotalApprovedAmount] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      getRequest(
        `funding_feedback/club_funding_list?club_id=${id}`,
        (data) => {
          console.log(data);
          setFundings(data.fundings);
          setClubName(data.clubName);
          setTotalExpenditureAmount(data.totalExpenditureAmount);
          setTotalApprovedAmount(data.totalApprovedAmount);
        },
        (error) => console.error("Failed to fetch activities:", error)
      );
    };

    fetchActivities();
  }, [id]);

  return (
    <div className="club-funding-list">
      <div className="frame-6">
        <UpperBar className={"upper-bar"} title={`${clubName} 지원금 신청`} />
        <div className="frame-wrapper">
          <div className="frame-10">
            <div className="frame-11">
              <div className="frame-12">
                <div className="frame-13">
                  <SubTitle
                    className="sub-title-instance"
                    text="지원금 신청 검토 현황"
                  />
                  <div className="frame-14">
                    <ClubFundingElement type="zero" />
                    {Array.isArray(fundings) &&
                      fundings.map((funding, index) => (
                        <ClubFundingElement
                          key={index}
                          type="one"
                          clubId={parseInt(id ? id : "0")}
                          fundingId={funding.fundingId}
                          number={(index + 1).toString()}
                          name={funding.name}
                          expenditureAmount={`${funding.expenditureAmount}원`}
                          approvedAmount={`${funding.approvedAmount}원`}
                          feedbackName={funding.feedbackMemberName}
                          executiveName={funding.executiveName}
                          executiveId={funding.executive_id}
                          feedbackState={funding.feedbackType}
                        />
                      ))}
                    <ClubFundingElement
                      type="two"
                      expenditureAmount={`${totalExpenditureAmount}원`}
                      approvedAmount={`${totalApprovedAmount}원`}
                    />
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
