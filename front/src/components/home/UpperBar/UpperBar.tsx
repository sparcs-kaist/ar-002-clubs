/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingBar } from "../LoadingBar";
import { UpperbarMenu } from "../UpperbarMenu";

import { useAuth } from "contexts/authContext";

import Logo from "assets/Images/Logo.png";
import BackImg from "assets/Images/BackImage.png";
import "./UpperBar.css";
import Profile from "assets/Images/profile.png";
import { getRequest } from "utils/api";
import { Unavailable } from "utils/util";
import { useExecutiveStatus } from "hooks/useUserPermission";

interface Props {
  className: any;
  title?: string | null;
}

export const UpperBar = ({ className, title }: Props): JSX.Element => {
  const { user, logout } = useAuth(); // authContext에서 user 정보 가져오기
  const { executiveStatuses } = useExecutiveStatus(true);
  const navigate = useNavigate();

  const [showSubMenu1, setShowSubMenu1] = useState(false);
  const [showSubMenu2, setShowSubMenu2] = useState(false);
  const [showSubMenu3, setShowSubMenu3] = useState(false);
  const [showSubMenu4, setShowSubMenu4] = useState(false);
  const [showSubMenu5, setShowSubMenu5] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      getRequest("auth/login", (data) => {
        const loginUrl = data.loginUrl;
        window.location.href = loginUrl;
      });
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed!");
    }
  };

  const handleLogout = async (e: FormEvent) => {
    e.preventDefault();

    // Confirmation dialog
    const isConfirmed = window.confirm("정말 로그아웃 하시겠습니까?");

    // Proceed with logout only if user confirms
    if (isConfirmed) {
      try {
        console.log(user);
        if (user) {
          getRequest(`auth/logout?userId=${user.sid}`, (data) => {
            const logoutUrl = data.logoutUrl;
            console.log(logoutUrl);
            logout(); // Assuming 'logout' is a function that handles the client-side logout process
            window.location.href = logoutUrl;
          });
        } else {
          alert("Invalid user information!"); // 유효하지 않은 사용자 정보에 대한 경고 메시지
        }
      } catch (error) {
        console.error("Logout Error:", error);
        alert("Logout failed!");
      }
    }
  };

  return (
    <div className={`upper-bar ${className}`}>
      <img className="background" src={BackImg} />
      <div
        className="group"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        <img className="image" alt="Image" src={Logo} />
        <div className="div-clubs">Clubs</div>
      </div>
      <div className="frame">
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu1(true)}
          onMouseLeave={() => setShowSubMenu1(false)}
          style={{ position: "relative" }}
        >
          <UpperbarMenu
            className="upperbar-menu-instance"
            text="동아리"
            active={showSubMenu1}
          />
          {showSubMenu1 && (
            <div className="sub-menu">
              <button onClick={() => navigate("/club_list")}>
                동아리 목록
              </button>
              <button onClick={() => navigate("/cafe_notice")}>
                카페 공지사항
              </button>
              <button onClick={() => navigate("/my_club")}>나의 동아리</button>
              <button onClick={() => navigate("/club_manage")}>
                동아리 관리
              </button>
            </div>
          )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu2(true)}
          onMouseLeave={() => setShowSubMenu2(false)}
          style={{ position: "relative" }}
        >
          <UpperbarMenu
            className="upperbar-menu-instance"
            text="의결기구"
            active={showSubMenu2}
          />
          {showSubMenu2 && (
            <div className="sub-menu">
              <button onClick={() => navigate("/recent_meeting/0")}>
                최근 진행한 회의
              </button>
              <button onClick={() => navigate("/recent_meeting/1")}>
                전동대회
              </button>
              <button onClick={() => navigate("/recent_meeting/2")}>
                확대운영위원회
              </button>
              <button onClick={() => navigate("/recent_meeting/3")}>
                운영위원회
              </button>
              <button onClick={() => navigate("/recent_meeting/4")}>
                분과회의
              </button>
            </div>
          )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu3(true)}
          onMouseLeave={() => setShowSubMenu3(false)}
          style={{ position: "relative" }}
        >
          <UpperbarMenu
            className="upperbar-menu-instance"
            text="소통"
            active={showSubMenu3}
          />
          {showSubMenu3 && (
            <div className="sub-menu">
              <button onClick={Unavailable}>소통채널 안내</button>
              <button onClick={Unavailable}>카카오톡 문의하기</button>
              <button
                onClick={() =>
                  window.open(
                    "https://cafe.naver.com/ArticleList.nhn?search.clubid=26985838&search.menuid=19&search.boardtype=L",
                    "_blank"
                  )
                }
              >
                동아리연합회칙
              </button>
            </div>
          )}
        </div>
        <div
          className="upper-menu-group"
          onMouseEnter={() => setShowSubMenu4(true)}
          onMouseLeave={() => setShowSubMenu4(false)}
          style={{ position: "relative" }}
        >
          <UpperbarMenu
            className="upperbar-menu-instance"
            text="서비스 신청"
            active={showSubMenu4}
          />
          {showSubMenu4 && (
            <div className="sub-menu">
              <button onClick={Unavailable}>공용공간 임시사용</button>
              <button onClick={Unavailable}>활동확인서 발급</button>
              <button onClick={Unavailable}>서비스 신청</button>
            </div>
          )}
        </div>
        {executiveStatuses !== 0 && (
          <div
            className="upper-menu-group"
            onMouseEnter={() => setShowSubMenu5(true)}
            onMouseLeave={() => setShowSubMenu5(false)}
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => navigate("/admin")}
          >
            <UpperbarMenu
              className="upperbar-menu-instance"
              text="집행부"
              active={showSubMenu5}
            />
            {/* {showSubMenu4 && (
              <div className="sub-menu">
                <button onClick={Unavailable}>공용공간 임시사용</button>
                <button onClick={Unavailable}>활동확인서 발급</button>
                <button onClick={Unavailable}>서비스 신청</button>
              </div>
            )} */}
          </div>
        )}
      </div>
      {!title ? (
        <p className="clubs" style={{ fontFamily: "NanumBarunGothic-Regular" }}>
          <span className="span">동아리</span>
          <span className="text-wrapper-2">
            의 모든 것을 한번에
            <br />
            동아리연합회 통합 플랫폼,{" "}
          </span>
          <span className="text-wrapper-3">Clubs</span>
          <span className="text-wrapper-4"> 입니다.</span>
        </p>
      ) : (
        <p className="clubs">
          <span className="text-wrapper-title">{title}</span>
        </p>
      )}

      <LoadingBar className="loading-bar-instance" />
      <div className="frame-200">
        <img className="img-100" alt="Image" src={Profile} />
        <div className="login">
          {user ? (
            <div
              className="text-wrapper"
              onClick={handleLogout}
              style={{
                cursor: "pointer",
              }}
            >
              {user.name} 님
            </div> // 로그인한 경우 사용자의 이름 표시
          ) : (
            <div
              className="text-wrapper"
              onClick={handleLogin}
              style={{ cursor: "pointer" }}
            >
              로그인{" "}
            </div> // 로그인하지 않은 경우 로그인 버튼 표시
          )}
        </div>
      </div>
    </div>
  );
};
