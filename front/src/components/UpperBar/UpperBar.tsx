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
import "./style.css";

interface Props {
  className: any;
}

export const UpperBar = ({ className }: Props): JSX.Element => {

  const { user, logout } = useAuth(); // authContext에서 user 정보 가져오기
  const navigate = useNavigate();

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
      <div className="group">
        <img className="image" alt="Image" src={Logo} />
        <div className="div-clubs">Clubs</div>
      </div>
      <div className="frame">
        <UpperbarMenu className="upperbar-menu-instance" text="동아리" />
        <UpperbarMenu className="upperbar-menu-instance" text="의결기구" />
        <UpperbarMenu className="upperbar-menu-instance" text="소통" />
        <UpperbarMenu className="upperbar-menu-instance" text="서비스 신청" />
      </div>
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
      <LoadingBar className="loading-bar-instance" />
      <div className="frame-2">
        <img className="img" alt="Image" src="image-5.png" />
        <div className="login">
          {user ? (
            <div className="text-wrapper" onClick={handleLogout}>{user.first_name}님</div> // 로그인한 경우 사용자의 이름 표시
          ) : (
            <div className="text-wrapper" onClick={handleLogin}>로그인 </div> // 로그인하지 않은 경우 로그인 버튼 표시
          )}
        </div>
      </div>
    </div>
  );
};
