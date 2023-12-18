// useUserRepresentativeStatus 훅 수정
import { useEffect, useState } from "react";
import { getRequest } from "utils/api";
import { useNavigate } from "react-router-dom";

export const useUserRepresentativeStatus = () => {
  const navigate = useNavigate();
  const [userStatus, setUserStatus] = useState({
    typeId: 0,
    clubId: 0,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUserStatus = () => {
      getRequest(
        "user/is_representitive",
        (data) => {
          setUserStatus({ ...data, isLoading: false });
        },
        (error) => {
          console.error("Failed to fetch user status:", error);
          setUserStatus({ typeId: 0, clubId: 0, isLoading: false });
        }
      );
    };

    fetchUserStatus();
  }, []);

  useEffect(() => {
    if (!userStatus.isLoading && userStatus.typeId === 0) {
      alert("권한이 없습니다. 대표자/대의원만 접근 가능합니다.");
      navigate(-1);
    }
  }, [userStatus.isLoading, userStatus.typeId, navigate]);

  return userStatus;
};
