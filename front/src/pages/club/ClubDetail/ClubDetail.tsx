import React, { useEffect, useState } from "react";
import { SubTitle } from "components/home/SubTitle";
import { UnderBar } from "components/home/UnderBar";
import "./ClubDetail.css";
import { UpperBar } from "components/home/UpperBar";
import { useParams } from "react-router-dom";
import { getRequest } from "utils/api";

interface ClubDetails {
  id: number;
  clubName: string;
  divisionName: string;
  clubType: string;
  characteristicKr: string;
  advisor: string;
  totalMembers: number;
  clubPresident: string;
  description: string;
  foundingYear: number;
  room: string;
}

export const ClubDetail = (): JSX.Element => {
  const { id } = useParams();
  const [clubDetails, setClubDetails] = useState<ClubDetails>({
    id: 0,
    clubName: "",
    divisionName: "",
    clubType: "",
    characteristicKr: "",
    advisor: "",
    totalMembers: 0,
    clubPresident: "",
    description: "",
    foundingYear: 0,
    room: "",
  });

  useEffect(() => {
    const fetchClubDetails = async () => {
      await getRequest(
        `club/club_detail?club_id=${id}`,
        (data) => setClubDetails(data.data),
        (error) => console.error("Failed to fetch club details:", error)
      );
    };
    fetchClubDetails();
  }, [id]);

  return (
    <div className="club-detail">
      <div className="frame-2">
        <UpperBar title={clubDetails.clubName} className="upper-bar" />
        <div className="frame-wrapper">
          <div className="frame-6">
            <div className="frame-7">
              <SubTitle
                text="동아리 정보"
                className="sub-title-instance"
                divClassName=""
              />
              <div className="frame-8">
                <p className="p">
                  <span className="span">동아리 지위:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.clubType}
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">소속 분과:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.divisionName}
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">성격:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.characteristicKr}
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">설립연도:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.foundingYear}년
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">동아리방:</span>
                  <span className="text-wrapper-6"> {clubDetails.room}</span>
                </p>
              </div>
            </div>
            <div className="frame-7">
              <SubTitle
                className="sub-title-instance"
                text="인적 사항"
                divClassName=""
              />
              <div className="frame-8">
                <p className="p">
                  <span className="span">총원:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.totalMembers}명
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">대표자:</span>
                  <span className="text-wrapper-6">
                    {" "}
                    {clubDetails.clubPresident}
                  </span>
                </p>
                <p className="div-2">
                  <span className="span">지도교수:</span>
                  <span className="text-wrapper-6"> {clubDetails.advisor}</span>
                </p>
              </div>
            </div>
            <div className="frame-7">
              <SubTitle
                className="sub-title-instance"
                text="동아리 설명"
                divClassName=""
              />
              <div className="frame-8">
                <p className="text-wrapper-7">{clubDetails.description}</p>
              </div>
            </div>
          </div>
        </div>
        <UnderBar />
      </div>
    </div>
  );
};
