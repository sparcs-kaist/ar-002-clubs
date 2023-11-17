import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClubListTitle } from "../../components/ClubListTitle";
import { ClubListElement } from "components/ClubListElement";
import { SubTitle } from "../../components/SubTitle";
import { UpperBar } from "components/UpperBar";
import { UnderBar } from "components/UnderBar";
import "./MyClub.css";
import { useAuth } from "contexts/authContext";

type DivisionType = {
  semester_id: number;
  year_semester: string;  // Assuming year and semester are concatenated as a string
  prop: number;
  clubs: any[];
};

export const MyClub = (): JSX.Element => {
  const [divisions, setDivisions] = useState<DivisionType[]>([]);

  const clubListRef = useRef<HTMLDivElement>(null);

  const {user} = useAuth();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (clubListRef.current) {
        const height = clubListRef.current.offsetHeight + clubListRef.current.offsetTop;
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
    // 사용자 정보가 유효한 경우에만 요청을 수행합니다.
    if (user && user.student_id) {
      axios.get(`http://localhost/api/club/my_semester/${user.student_id}`)
        .then(response => {
          console.log(response.data);
          const divisionsWithProps = response.data.map((semesterInfo: DivisionType) => ({
            ...semesterInfo,
            prop: 0,
            clubs: []
          }));
          setDivisions(divisionsWithProps);
        })
        .catch(error => {
          console.error("There was an error fetching the data!", error);
        });
    }
  }, [user]);

  const handleTitleClick = (divisionId: number) => {
    const updatedDivisions = divisions.map(division => {
      if (division.semester_id === divisionId) {
        if (division.prop === 0) {
          axios.get(`http://localhost/api/club/my_semester_clubs?semester_id=${divisionId}&student_id=${user.student_id}`)
            .then(response => {
              division.prop = 1;
              division.clubs = response.data.data;
              setDivisions([...divisions]);
            })
            .catch(error => {
              console.error("There was an error fetching the clubs data!", error);
            });
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
    for (var i=0; i < arr.length; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  }

  return (
    <div className="my-club" ref={clubListRef}>
      <UpperBar className="upper-bar" title="나의 동아리"/>
      <SubTitle className="sub-title-instance" divClassName="design-component-instance-node" text="나의 동아리" />
      <div className="frame-8">
        {divisions.map((division, index) => (
          <div key={index}>
            <ClubListTitle prop={division.prop} title={division.year_semester} id={division.semester_id} onClick={() => handleTitleClick(division.semester_id)}/>
            {division.prop === 1 && (
              <div className="frame-9">
                {chunkArray(division.clubs, 2).map((clubPair, idx) => (
                  <div className="frame-10" key={idx}>
                    {clubPair.map((club, idx) => (
                      <ClubListElement 
                        key={idx}
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
        <UnderBar/>
      </div>
    </div>
  );
};