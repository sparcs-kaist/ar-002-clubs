import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { getRequest } from "utils/api";

interface ExecutiveStatusContextType {
  executiveStatuses: number; // Updated to match the naming convention
  isLoading: boolean;
  checkStatus: (disabled?: boolean) => void;
  deleteStatus: () => void; // Add this line
}

const ExecutiveStatusContext = createContext<ExecutiveStatusContextType | null>(
  null
);

interface ExecutiveStatusProviderProps {
  children: React.ReactNode;
}

export const ExecutiveStatusProvider = ({
  children,
}: ExecutiveStatusProviderProps) => {
  const [executiveStatuses, setExecutiveStatuses] = useState<number>(0); // Updated to match the naming convention
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const deleteStatus = () => {
    localStorage.removeItem("executiveStatus");
    setExecutiveStatuses(0);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const checkCountRef = useRef(0); // 호출 횟수를 추적하는 ref

  const checkStatus = async (disabled: boolean = false) => {
    console.log(disabled);
    try {
      const storedStatus = localStorage.getItem("executiveStatus");
      if (storedStatus) {
        setExecutiveStatuses(JSON.parse(storedStatus));
        setIsLoading(false);
      } else {
        await getRequest(
          "user/is_executive",
          (data) => {
            setExecutiveStatuses(data.result);
            localStorage.setItem(
              "executiveStatus",
              JSON.stringify(data.result)
            );
            setIsLoading(false);
            if (!disabled && data.result === 0) {
              alert("접근 권한이 없습니다. 집행부원만 접근 가능합니다.");
              navigate(-1);
            }
          },
          (error) => {
            console.error("Failed to fetch user status:", error);
            setExecutiveStatuses(0);
            setIsLoading(false);
            if (!disabled) {
              checkCountRef.current += 1; // 호출 횟수 증가
              if (checkCountRef.current === 3) {
                alert("접근 권한이 없습니다. 집행부원만 접근 가능합니다.");
                navigate(-1);
                checkCountRef.current = 0; // 카운트 초기화
              }
            }
          }
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  return (
    <ExecutiveStatusContext.Provider
      value={{ executiveStatuses, isLoading, checkStatus, deleteStatus }}
    >
      {children}
    </ExecutiveStatusContext.Provider>
  );
};

export const useExecutiveStatus = (disabled?: boolean) => {
  // console.log(disabled);
  const context = useContext(ExecutiveStatusContext);
  if (!context) {
    throw new Error(
      "useExecutiveStatus must be used within an ExecutiveStatusProvider"
    );
  }

  useEffect(() => {
    context.checkStatus(disabled);
  }, [disabled, context]);

  return context;
};

export const useDeleteExecutive = () => {
  const context = useContext(ExecutiveStatusContext);
  if (!context) {
    throw new Error(
      "useDeleteExecutive must be used within an ExecutiveStatusProvider"
    );
  }
  return context.deleteStatus;
};
