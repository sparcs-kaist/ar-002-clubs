import React, { useState, useEffect, useRef } from "react";
import { ClubListTitle } from "../../../components/club/ClubListTitle";
import { ClubListElement } from "components/club/ClubListElement";
import { SubTitle } from "../../../components/home/SubTitle";
import { UpperBar } from "components/home/UpperBar";
import { UnderBar } from "components/home/UnderBar";
import "./ClubList.css";
import { getRequest, postRequest } from "utils/api";
import { useMemberDuration } from "hooks/useReportDurationStatus";
import { useAuth } from "contexts/authContext";

type DivisionType = {
  id: number;
  name: string;
  prop: number;
  clubs: any[];
};

export const ClubList = (): JSX.Element => {
  const [divisions, setDivisions] = useState<DivisionType[]>([]);

  const clubListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // authContext에서 user 정보 가져오기

  const { status } = useMemberDuration(true);

  // New function to load club data for a division
  const loadClubsForDivision = (division: DivisionType) => {
    getRequest(`club/division_clubs?division_id=${division.id}`, (data) => {
      const updatedDivision = {
        ...division,
        prop: 1,
        clubs: data.data,
      };
      setDivisions((prevDivisions) =>
        prevDivisions.map((div) =>
          div.id === division.id ? updatedDivision : div
        )
      );
    });
  };

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

  useEffect(() => {
    getRequest("club/division_list", (data) => {
      const divisionsWithProps = data.data.map((division: DivisionType) => ({
        ...division,
        prop: 0, // Initially set to 0
        clubs: [],
      }));

      setDivisions(divisionsWithProps);

      // Load clubs for each division
      divisionsWithProps.forEach(loadClubsForDivision);
    });
  }, []);

  const handleTitleClick = (divisionId: number) => {
    const updatedDivisions = divisions.map((division) => {
      if (division.id === divisionId) {
        if (division.prop === 0) {
          getRequest(
            `club/division_clubs?division_id=${divisionId}`,
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

  const handleRegister = (state: number, clubId: number, clubName: string) => {
    console.log(state, clubId);
    if (state === 0) {
      const isConfirmed = window.confirm(`${clubName}에 가입하시겠습니까?`);

      // Proceed with logout only if user confirms
      if (isConfirmed) {
        postRequest(`member/apply?club_id=${clubId}`, {}, () => {
          //divisons의 clubs 중 id가 club_id인 원소의 registrationState를 1로 변경
          setDivisions((prevDivisions) =>
            prevDivisions.map((division) => ({
              ...division,
              clubs: division.clubs.map((club) =>
                club.id === clubId ? { ...club, registrationState: 1 } : club
              ),
            }))
          );
        });
      }
    } else if (state === 1) {
      const isConfirmed = window.confirm(
        `${clubName}에 가입을 취소하시겠습니까?`
      );

      // Proceed with logout only if user confirms
      if (isConfirmed) {
        postRequest(`member/cancel?club_id=${clubId}`, {}, () => {
          //divisons의 clubs 중 id가 club_id인 원소의 registrationState를 0으로 변경
          setDivisions((prevDivisions) =>
            prevDivisions.map((division) => ({
              ...division,
              clubs: division.clubs.map((club) =>
                club.id === clubId ? { ...club, registrationState: 0 } : club
              ),
            }))
          );
        });
      }
    }
  };

  return (
    <div className="club-list" ref={clubListRef}>
      <UpperBar className="upper-bar" title="동아리 목록" />
      <SubTitle
        className="sub-title-instance"
        divClassName="design-component-instance-node"
        text="동아리 목록"
      />
      <div className="frame-8">
        {divisions.map((division, index) => (
          <div key={index}>
            <ClubListTitle
              prop={division.prop}
              title={division.name}
              id={division.id}
              onClick={() => handleTitleClick(division.id)}
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
                        isRegistration={status === 1 && user}
                        registrationState={club.registrationState}
                        onRegistrationClick={() =>
                          handleRegister(
                            club.registrationState,
                            club.id,
                            club.clubName
                          )
                        }
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
