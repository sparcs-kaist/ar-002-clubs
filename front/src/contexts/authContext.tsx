import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { getRequest } from "utils/api";

interface AuthContextProps {
  user: any | null;
  login: (userInfo: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // 페이지를 로드할 때 localStorage에서 사용자 정보를 로드합니다.
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const login = (userInfo: any) => {
    setUser(userInfo);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
function deleteExecutive() {
  throw new Error("Function not implemented.");
}
