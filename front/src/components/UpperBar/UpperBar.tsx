/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { LoadingBar } from "../LoadingBar";
import { UpperbarMenu } from "../UpperbarMenu";

import { useAuth } from "contexts/authContext";

import Logo from "assets/Images/Logo.png";
import BackImg from "assets/Images/BackImg.png";
import "./UpperBar.css";
import Profile from "assets/Images/profile.png";

interface Props {
  className: any;
  title?: string|null;
}

export const UpperBar = ({ className, title }: Props): JSX.Element => {

  const { user, logout } = useAuth(); // authContext에서 user 정보 가져오기
  const navigate = useNavigate();

  const [showSubMenu1, setShowSubMenu1] = useState(false);
  const [showSubMenu2, setShowSubMenu2] = useState(false);
  const [showSubMenu3, setShowSubMenu3] = useState(false);
  const [showSubMenu4, setShowSubMenu4] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.get('http://127.0.0.1/api/auth/login');
      const loginUrl = response.data.loginUrl;
      
      window.location.href = loginUrl;
    } catch (error) {
      console.error('Login Error:', error);
      alert('Login failed!');
    }
  };

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // 만약 user 객체가 id 속성을 가지고 있다면
      console.log(user)
      if (user) {
        const response = await axios.get(`http://127.0.0.1/api/auth/logout?userId=${user.sid}`);
        const logoutUrl = response.data.logoutUrl;
        window.location.href = logoutUrl;
        logout();
      } else {
        alert('Invalid user information!'); // 유효하지 않은 사용자 정보에 대한 경고 메시지
      }
    } catch (error) {
      console.error('Logout Error:', error);
      alert('Logout failed!');
    }
  };

  return (
    <div className={`upper-bar ${className}`}>
      <img className="background" src = {BackImg}/>
      <div className="group" onClick={() => navigate("/")} style={{cursor: "pointer"}}>
        <img className="image" alt="Image" src={Logo} />
        <div className="div-clubs">Clubs</div>
      </div>
      <div className="frame">
      <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu1(true)}
          onMouseLeave={() => setShowSubMenu1(false)}
          style={{position: 'relative'}} 
        >
          <UpperbarMenu className="upperbar-menu-instance" text="동아리" active={showSubMenu1}/>  
            {showSubMenu1 && (
              <div className="sub-menu">
                  <button onClick={() => navigate("/club_list")}>동아리 목록</button>
                  <button onClick={() => navigate("/cafe_notice")}>카페 공지사항</button>
                  <button onClick={() => navigate("/my_club")}>나의 동아리</button>
                  <button onClick={() => navigate("/maneger")}>동아리/분과 관리</button>
              </div>
            )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu2(true)}
          onMouseLeave={() => setShowSubMenu2(false)}
          style={{position: 'relative'}} 
        >
          <UpperbarMenu className="upperbar-menu-instance" text="의결기구" active={showSubMenu2}/>  
            {showSubMenu2 && (
              <div className="sub-menu">
                  <button onClick={() => navigate("/ceo-message")}>최근 진행한 회의</button>
                  <button onClick={() => navigate("/history")}>전동대회</button>
                  <button onClick={() => navigate("/map")}>확대운영위원회</button>
                  <button onClick={() => navigate("/map")}>운영위원회</button>
                  <button onClick={() => navigate("/map")}>분과회의</button>
              </div>
            )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu3(true)}
          onMouseLeave={() => setShowSubMenu3(false)}
          style={{position: 'relative'}} 
        >
          <UpperbarMenu className="upperbar-menu-instance" text="소통" active={showSubMenu3}/>  
            {showSubMenu3 && (
              <div className="sub-menu">
                  <button onClick={() => navigate("/ceo-message")}>소통채널 안내</button>
                  <button onClick={() => navigate("/history")}>카카오톡 문의하기</button>
                  <button onClick={() => navigate("/map")}>동아리연합회칙</button>
              </div>
            )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu4(true)}
          onMouseLeave={() => setShowSubMenu4(false)}
          style={{position: 'relative'}} 
        >
          <UpperbarMenu className="upperbar-menu-instance" text="서비스 신청" active={showSubMenu4}/>  
            {showSubMenu4 && (
              <div className="sub-menu">
                  <button onClick={() => navigate("/ceo-message")}>공용공간 임시사용</button>
                  <button onClick={() => navigate("/history")}>활동확인서 발급</button>
                  <button onClick={() => navigate("/map")}>서비스 신청</button>
              </div>
            )}
        </div>
      </div>
        {!title ?
        <p className="clubs">
          <span className="span">동아리</span>
          <span className="text-wrapper-2">
            의 모든 것을 한번에
            <br />
            동아리연합회 통합 플랫폼,{" "}
          </span>
          <span className="text-wrapper-3">Clubs</span>
          <span className="text-wrapper-4"> 입니다.</span>
        </p>
        :
          <p className="clubs">
            <span className="text-wrapper-21">{title}</span>
          </p>
        }
        
      <LoadingBar className="loading-bar-instance" />
      <div className="frame-2">
        <img className="img" alt="Image" src={Profile} />
        <div className="login">
          {user ? (
            <div className="text-wrapper" onClick={handleLogout} style={{cursor: "pointer"}}>{user.name} 님</div> // 로그인한 경우 사용자의 이름 표시
          ) : (
            <div className="text-wrapper" onClick={handleLogin} style={{cursor: "pointer"}}>로그인 </div> // 로그인하지 않은 경우 로그인 버튼 표시
          )}
        </div>
      </div>
    </div>
  );
};
