import { useState, useEffect } from "react";
import { getRequest } from "utils/api";

export const useReportDurationStatus = () => {
  const [reportState, setReportState] = useState({
    durationStatus: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchReportDurationStatus = () => {
      getRequest(
        "activity/is_report_duration",
        (data) => {
          setReportState({
            durationStatus: data.reportStatus,
            isLoading: false,
            error: null,
          });
        },
        (error) => {
          console.error("Failed to fetch report duration status:", error);
          setReportState({
            durationStatus: 0,
            isLoading: false,
            error: error,
          });
        }
      );
    };

    fetchReportDurationStatus();
  }, []);

  return reportState;
};
