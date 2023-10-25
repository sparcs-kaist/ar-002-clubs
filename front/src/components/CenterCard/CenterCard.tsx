import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CentercardList } from "../CentercardList";
import { SubTitle } from "../SubTitle";
import "./style.css";

interface Props {
  SubTitleText: string;
}

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  link: string;
}

export const CenterCard = ({ SubTitleText }: Props): JSX.Element => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);  // Define a state variable to hold the posts

  const handleMoreClick = () => {
    if (SubTitleText === "카페 공지사항") {
      navigate("/cafe_notice")
    }
  };

  useEffect(() => {
    if (SubTitleText === "카페 공지사항") {
      fetch('http://127.0.0.1/api/cafenotice/?pageOffset=1&itemCount=6')
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPosts(data);  // If data is an array, set it to posts
          } else if (data.posts && Array.isArray(data.posts)) {
            setPosts(data.posts);  // If data.posts is an array, set it to posts
          } else {
            console.error('Unexpected data format:', data);
            setPosts([]);  // Set to empty array if data format is unexpected
          }
        })
        .catch(error => console.error('Error fetching data:', error));
    } else {
      setPosts([]);  // Set to empty array if subtitleText is not "카페 공지사항"
    }
  }, [SubTitleText]);  // Run effect whenever SubTitleText changes

  return (
    <div className="center-card">
      <div className={`rectangle`}>
        <div className="rectangle-2" />
        <div className="frame">
          {posts.map(post => (  // Map over the posts to generate CentercardList items
            <CentercardList 
              key={post.id}
              title={post.title}
              subtitle={post.date}
              url={post.link}
            />
          ))}
        </div>
      </div>
      <SubTitle text={SubTitleText} divClassName = "" className="" />
      <div className="text-wrapper-3" onClick={handleMoreClick} style={{cursor: 'pointer'}}>더보기&gt;</div>
    </div>
  );
};
