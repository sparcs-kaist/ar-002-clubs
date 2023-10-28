import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ClubListTitle } from "../../components/ClubListTitle";
import { ClubListElement } from "components/ClubListElement";
import { SubTitle } from "../../components/SubTitle";
import { UpperBar } from "components/UpperBar";
import { UnderBar } from "components/UnderBar";
import "./ClubList.css";

type DivisionType = {
  id: number;
  name: string;
  prop: number;
  clubs: any[];
};

export const ClubList = (): JSX.Element => {
  const [divisions, setDivisions] = useState<DivisionType[]>([]);

  const clubListRef = useRef<HTMLDivElement>(null);

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
    axios.get('http://localhost/api/club/division_list')
      .then(response => {
        const divisionsWithProps = response.data.data.map((division: DivisionType) => ({
          ...division,
          prop: 0,
          clubs: []
        }));
        setDivisions(divisionsWithProps);
      })
      .catch(error => {
        console.error("There was an error fetching the data!", error);
      });
  }, []);

  const handleTitleClick = (divisionId: number) => {
    const updatedDivisions = divisions.map(division => {
      if (division.id === divisionId) {
        if (division.prop === 0) {
          axios.get(`http://localhost/api/club/division_clubs?division_id=${divisionId}`)
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
    <div className="club-list" ref={clubListRef}>
      <UpperBar className="upper-bar" title="동아리 목록"/>
      <SubTitle className="sub-title-instance" divClassName="design-component-instance-node" text="동아리 목록" />
      <div className="frame-8">
        {divisions.map((division, index) => (
          <div key={index}>
            <ClubListTitle prop={division.prop} title={division.name} id={division.id} onClick={() => handleTitleClick(division.id)}/>
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