import React, { useState, useEffect } from 'react';
import { CafenoticeList } from "components/CafenoticeList";
import { LoadingBar } from "components/LoadingBar";
import { SubTitle } from "components/SubTitle";
import { UpperBar } from "components/UpperBar";
import "./CafeNotice.css";
import { UnderBar } from "components/UnderBar";
import { getRequest } from 'utils/api';

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  link: string;
}

export const CafeNotice = (): JSX.Element => {
  const [page, setPage] = useState(1);  // Manage the current page number
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        getRequest(`cafenotice/?pageOffset=${page}&itemCount=10`,
          data=>{
            setPosts(data.posts);
            setTotalPosts(data.totalPosts);
          }
        )
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(totalPosts / 10);

  return (
    <div className="cafe-notice">
      <UpperBar className="" title="카페 공지사항"/>
      <UnderBar />
      <SubTitle text="카페 공지사항" className="sub-title-instance" divClassName="" />
      <div className="frame-6">
        {posts.map(post => (
          <CafenoticeList 
            key={post.id} 
            title={post.title} 
            author={post.author} 
            date={post.date} 
            url={post.link} 
          />
        ))}
      </div>
      <div className="frame-7">
        <div 
          className={`text-wrapper-9 ${page <= 1 ? 'disabled' : ''}`}
          onClick={() => page > 1 && setPage(page - 1)}
        >
          &lt;이전
        </div>
        <div className="text-wrapper-9">{page}</div>
        <div 
          className={`text-wrapper-9 ${page >= totalPages ? 'disabled' : ''}`}
          onClick={() => page < totalPages && setPage(page + 1)}
        >
          다음&gt;
        </div>
      </div>
    </div>
  );
};
