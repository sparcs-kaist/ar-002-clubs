// usePageHeight.ts
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export function usePageHeight(): number {
  const [pageHeight, setPageHeight] = useState<number>(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setPageHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize();  // 처음 로드 될 때 높이 설정

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [pathname]);  // 라우트가 변경될 때마다 이 훅을 재실행

  return pageHeight;
}
