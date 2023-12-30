import React, { useState, useEffect, useRef } from "react";
import { ClubListTitle } from "../../../components/club/ClubListTitle";
import { ClubListElement } from "components/club/ClubListElement";
import { SubTitle } from "../../../components/home/SubTitle";
import { UpperBar } from "components/home/UpperBar";
import { UnderBar } from "components/home/UnderBar";
import "./MyClub.css";
import { useAuth } from "contexts/authContext";
import { getRequest } from "utils/api";

type DivisionType = {
  semester_id: number;
  year_semester: string; // Assuming year and semester are concatenated as a string
  prop: number;
  clubs: any[];
};

export const MyClub = (): JSX.Element => {
  const [divisions, setDivisions] = useState<DivisionType[]>([]);

  const clubListRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (clubListRef.current) {
        const height =
          clubListRef.current.offsetHeight + clubListRef.current.offsetTop;
        clubListRef.current.style.height = `${height}px`;
      }
    });

    if (clubListRef.current) {
      observer.observe(clubListRef.current, { childList: true, subtree: true });
    }

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  const loadClubsForDivision = (division: DivisionType) => {
    getRequest(
      `club/my_semester_clubs?semester_id=${division.semester_id}`,
      (data) => {
        const updatedDivision = {
          ...division,
          prop: 1,
          clubs: data.data,
        };
        setDivisions((prevDivisions) =>
          prevDivisions.map((div) =>
            div.semester_id === division.semester_id ? updatedDivision : div
          )
        );
      }
    );
  };

  useEffect(() => {
    // 사용자 정보가 유효한 경우에만 요청을 수행합니다.
    if (user) {
      getRequest("club/my_semester", (data) => {
        const divisionsWithProps = data.map((semesterInfo: DivisionType) => ({
          ...semesterInfo,
          prop: 0,
          clubs: [],
        }));
        setDivisions(divisionsWithProps);
        divisionsWithProps.forEach(loadClubsForDivision);
      });
    }
  }, [user]);

  const handleTitleClick = (divisionId: number) => {
    const updatedDivisions = divisions.map((division) => {
      if (division.semester_id === divisionId) {
        if (division.prop === 0) {
          getRequest(
            `club/my_semester_clubs?semester_id=${divisionId}`,
            (data) => {
              division.prop = 1;
              division.clubs = data.data;
              setDivisions([...divisions]);
            }
          );
        } else {
          division.prop = 0;
          division.clubs = [];
        }
      }
      return division;
    });
    setDivisions(updatedDivisions);
  };

  const chunkArray = (arr: any[], chunkSize: number) => {
    var R = [];
    for (var i = 0; i < arr.length; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  return (
    <div className="my-club" ref={clubListRef}>
      <UpperBar className="upper-bar" title="나의 동아리" />
      <SubTitle
        className="sub-title-instance"
        divClassName="design-component-instance-node"
        text="나의 동아리"
      />
      <div className="frame-8">
        {divisions.map((division, index) => (
          <div key={index}>
            <ClubListTitle
              prop={division.prop}
              title={division.year_semester}
              id={division.semester_id}
              onClick={() => handleTitleClick(division.semester_id)}
            />
            {division.prop === 1 && (
              <div className="frame-9">
                {chunkArray(division.clubs, 2).map((clubPair, idx) => (
                  <div className="frame-10" key={idx}>
                    {clubPair.map((club, idx) => (
                      <ClubListElement
                        key={idx}
                        id={club.id}
                        name={club.clubName}
                        character={club.characteristicKr}
                        type={club.clubType}
                        president={club.clubPresident}
                        advisor={club.advisor}
                        totalNumbers={club.totalMembers}
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <UnderBar />
      </div>
    </div>
  );
};
