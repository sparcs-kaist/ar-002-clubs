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
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]); // Define a state variable to hold the posts

  const handleMoreClick = () => {
    if (SubTitleText === "카페 공지사항") {
      navigate("/cafe_notice");
    } else if (SubTitleText === "나의 동아리") {
      navigate("/my_club");
    } else if (SubTitleText === "최근 진행한 회의") {
      navigate("/recent_meeting/0");
    }
  };

  useEffect(() => {
    if (SubTitleText === "카페 공지사항") {
      getRequest(`cafenotice/?pageOffset=1&itemCount=6`, (data) => {
        if (data && data.posts && Array.isArray(data.posts)) {
          setPosts(
            data.posts.map(
              (item: { id: any; title: any; date: any; link: any }) => ({
                id: item.id.toString(),
                title: item.title,
                subtitle: item.date,
                url: item.link,
              })
            )
          );
        } else {
          console.error("Unexpected data format:", data);
        }
      });
    } else if (SubTitleText === "나의 동아리" && user && user.student_id) {
      getRequest(`club/my_semester_clubs`, (data) => {
        if (data && data.data && Array.isArray(data.data)) {
          setPosts(
            data.data.map(
              (item: { id: any; clubName: any; clubPresident: any }) => ({
                id: item.id.toString(),
                title: item.clubName,
                subtitle: item.clubPresident,
                url: `${process.env.REACT_APP_FRONTEND_URL}/club_detail/${item.id}`,
              })
            )
          );
        } else {
          console.error("Unexpected data format:", data);
        }
      });
    } else if (SubTitleText === "최근 진행한 회의") {
      getRequest(`meeting/?pageOffset=1&itemCount=6&typeId=0`, (data) => {
        if (data && data.meetings && Array.isArray(data.meetings)) {
          setPosts(
            data.meetings.map(
              (item: { id: any; title: any; meetingDate: any; link: any }) => ({
                id: item.id.toString(),
                title: item.title,
                subtitle: item.meetingDate,
                url: `${process.env.REACT_APP_FRONTEND_URL}/meeting_detail/${item.id}`,
              })
            )
          );
        } else {
          console.error("Unexpected data format:", data);
        }
      });
    } else if (SubTitleText === "회장단" && user && user.student_id) {
      setPosts([
        {
          id: "1",
          title: "상근 관리",
          subtitle: "전체",
          url: "",
        },
        {
          id: "1",
          title: "집행부원 상태 관리",
          subtitle: "회장단",
          url: "",
        },
      ]);
    } else if (SubTitleText === "사무국" && user && user.student_id) {
      setPosts([
        {
          id: "1",
          title: "지원금 신청 검토",
          subtitle: "전체",
          url: `${process.env.REACT_APP_FRONTEND_URL}/admin/funding_feedback`,
        },
        {
          id: "1",
          title: "지원금 신청 대시보드",
          subtitle: "사무국장",
          url: `${process.env.REACT_APP_FRONTEND_URL}/admin/funding_dashboard`,
        },
        {
          id: "1",
          title: "활동보고서 검토",
          subtitle: "전체",
          url: `${process.env.REACT_APP_FRONTEND_URL}/admin/activity_feedback`,
        },
        {
          id: "1",
          title: "활동보고서 대시보드",
          subtitle: "사무국장",
          url: `${process.env.REACT_APP_FRONTEND_URL}/admin/activity_dashboard`,
        },
      ]);
    } else if (SubTitleText === "관리국" && user && user.student_id) {
      setPosts([
        {
          id: "1",
          title: "정기 공용공간 사용신청 관리",
          subtitle: "관리국원",
          url: "",
        },
        {
          id: "1",
          title: "안전점검 관리",
          subtitle: "사무국장",
          url: "",
        },
      ]);
    } else {
      setPosts([]); // 다른 경우에는 비워둡니다.
    }
  }, [SubTitleText, user]); // Run effect whenever SubTitleText changes

  return (
    <div className="center-card">
      <div className={`rectangle`}>
        <div className="rectangle-2" />
        <div className="frame">
          {posts.map(
            (
              post // Map over the posts to generate CentercardList items
            ) => (
              <CentercardList
                key={post.id}
                title={post.title}
                subtitle={post.subtitle}
                url={post.url}
              />
            )
          )}
        </div>
      </div>
      <SubTitle text={SubTitleText} divClassName="" className="" />
      <div
        className="text-wrapper-3"
        onClick={handleMoreClick}
        style={{ cursor: "pointer" }}
      >
        더보기&gt;
      </div>
    </div>
  );
};
