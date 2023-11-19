import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CentercardList } from "../CentercardList";
import { SubTitle } from "../SubTitle";
import "./style.css";
import { useAuth } from "contexts/authContext";
import { getRequest } from "utils/api";

interface Props {
  SubTitleText: string;
}

interface Post {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

export const CenterCard = ({ SubTitleText }: Props): JSX.Element => {
  const navigate = useNavigate();
  const {user} = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);  // Define a state variable to hold the posts

  const handleMoreClick = () => {
    if (SubTitleText === "카페 공지사항") {
      navigate("/cafe_notice")
    }
    else if (SubTitleText === "나의 동아리") {
      navigate("/my_club")
    }
  };

  useEffect(() => {
    if (SubTitleText === "카페 공지사항") {
      getRequest(`cafenotice/?pageOffset=1&itemCount=6`,
        data=>{
          if (data && data.posts && Array.isArray(data.posts)) {
            setPosts(data.posts.map((item: { id: any; title: any; date: any; link: any; }) => ({
              id: item.id.toString(),
              title: item.title,
              subtitle: item.date,
              url: item.link
            })));
          } else {
            console.error('Unexpected data format:', data);
          }
        }
      )
    } else if (SubTitleText === "나의 동아리" && user && user.student_id) {
      getRequest(`club/my_semester_clubs`, 
        data => {
          if (data && data.data && Array.isArray(data.data)) {
            setPosts(data.data.map((item: { id: any; clubName: any; clubPresident: any; }) => ({
              id: item.id.toString(),
              title: item.clubName,
              subtitle: item.clubPresident,
              url: `${process.env.REACT_APP_FRONTEND_URL}/club_detail/${item.id}`
            })));
          } else {
            console.error('Unexpected data format:', data);
          }
        }
      );
    } else {
        setPosts([]);  // 다른 경우에는 비워둡니다.
      }
  }, [SubTitleText, user]);  // Run effect whenever SubTitleText changes

  return (
    <div className="center-card">
      <div className={`rectangle`}>
        <div className="rectangle-2" />
        <div className="frame">
          {posts.map(post => (  // Map over the posts to generate CentercardList items
            <CentercardList 
            key={post.id}
            title={post.title}
            subtitle={post.subtitle}
            url={post.url}
          />
          ))}
        </div>
      </div>
      <SubTitle text={SubTitleText} divClassName = "" className="" />
      <div className="text-wrapper-3" onClick={handleMoreClick} style={{cursor: 'pointer'}}>더보기&gt;</div>
    </div>
  );
};
