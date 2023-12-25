import { useEffect, useState } from "react";
import { getRequest, postRequest } from "utils/api";
import { useNavigate } from "react-router-dom";

// 서버로부터 반환되는 권한 정보의 인터페이스
interface PermissionResponse {
  authorized: Array<any>; // 권한이 있는지 여부
  isLoading: boolean; // 로딩 상태
}

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
      alert("접근 권한이 없습니다. 대표자/대의원만 접근 가능합니다.");
      navigate(-1);
    }
  }, [userStatus.isLoading, userStatus.typeId, navigate]);

  return userStatus;
};

export const useUserPermission = (permissions: any[]) => {
  const navigate = useNavigate();
  const [permissionResponse, setPermissionResponse] =
    useState<PermissionResponse>({
      authorized: [],
      isLoading: true,
    });

  useEffect(() => {
    const fetchUserPermission = async () => {
      try {
        await postRequest(
          "user/permission",
          { permissions },
          (response) => {
            const responseData = Array.isArray(response.data)
              ? response.data
              : [];
            setPermissionResponse({
              authorized: responseData,
              isLoading: false,
            });
          },
          (error) => {
            console.error("Failed to fetch user permission:", error);
            setPermissionResponse({ authorized: [], isLoading: false });
          }
        );
      } catch (error) {
        console.error("Failed to fetch user permission:", error);
        setPermissionResponse({ authorized: [], isLoading: false });
      }
    };

    fetchUserPermission();
    console.log(permissionResponse);
  }, []);

  useEffect(() => {
    if (
      !permissionResponse.isLoading &&
      permissionResponse.authorized.length === 0
    ) {
      alert("접근 권한이 없습니다.");
      navigate(-1);
    }
  }, [permissionResponse.isLoading]);

  return permissionResponse;
};