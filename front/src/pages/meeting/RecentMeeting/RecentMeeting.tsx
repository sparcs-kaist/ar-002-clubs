import React, { useState, useEffect } from "react";
import { CafenoticeList } from "components/home/CafenoticeList";
import { SubTitle } from "components/home/SubTitle";
import { UpperBar } from "components/home/UpperBar";
import "./RecentMeeting.css";
import { UnderBar } from "components/home/UnderBar";
import { getRequest } from "utils/api";
import { Button } from "components/meeting/Button";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingList } from "components/meeting/MeetingList";

interface Post {
  id: string;
  title: string;
  editor: string;
  meetingDate: string;
  link: string;
}

interface Props {
  id: number;
}

export const RecentMeeting = ({ id }: Props): JSX.Element => {
  const [page, setPage] = useState(1); // Manage the current page number
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [title, setTitle] = useState<string>("");
  const params = useParams();
  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        getRequest(
          `meeting/?pageOffset=${page}&itemCount=10&typeId=${id}`,
          (data) => {
            if (data && data.meetings) {
              setPosts(data.meetings);
              setTotalPosts(data.total);
            } else {
              setPosts([]); // 데이터가 없을 경우 빈 배열로 초기화
            }
          },
          (error) => {
            console.error("Failed to fetch posts:", error);
            setPosts([]); // 에러 발생 시 빈 배열로 초기화
          }
        );
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      }
    };
    fetchPosts();
  }, [page]);

  useEffect(() => {
    if (id === 0) {
      setTitle("최근 진행한 회의");
    } else if (id === 1) {
      setTitle("전동대회");
    } else if (id === 2) {
      setTitle("확대운영위원회");
    } else if (id === 3) {
      setTitle("운영위원회");
    } else if (id === 4) {
      setTitle("분과회의");
    }
  }, [id]);

  // 글쓰기 버튼 클릭 핸들러
  const handleWriteClick = () => {
    navigate(`/add_meeting/${id}`); // /add_meeting 경로로 이동하며 id 값을 전달
  };

  const totalPages = Math.ceil(totalPosts / 10);

  return (
    <div className="recent-meeting">
      <UpperBar className="" title={title} />
      <UnderBar />
      <SubTitle text={title} className="sub-title-instance" divClassName="" />
      <div className="frame-6">
        {posts.map((post) => (
          <MeetingList
            key={post.id}
            title={post.title}
            author={post.editor}
            date={post.meetingDate}
            url={post.id}
          />
        ))}
      </div>
      <div className="frame-7">
        <div
          className={`text-wrapper-9 ${page <= 1 ? "disabled" : ""}`}
          onClick={() => page > 1 && setPage(page - 1)}
        >
          &lt;이전
        </div>
        <div className="text-wrapper-9">{page}</div>
        <div
          className={`text-wrapper-9 ${page >= totalPages ? "disabled" : ""}`}
          onClick={() => page < totalPages && setPage(page + 1)}
        >
          다음&gt;
        </div>
      </div>
      <Button title="글쓰기" clickHandler={handleWriteClick} />
    </div>
  );
};
