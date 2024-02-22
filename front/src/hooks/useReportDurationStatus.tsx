import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

export const useFundingDurationStatus = () => {
  const [reportState, setReportState] = useState({
    durationStatus: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchFundingDurationStatus = () => {
      getRequest(
        "funding/is_funding_duration",
        (data) => {
          setReportState({
            durationStatus: data.fundingStatus,
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

    fetchFundingDurationStatus();
  }, []);

  return reportState;
};

export const useRegistrationDurationStatus = (disable: boolean = false) => {
  const navigate = useNavigate();

  const [reportState, setReportState] = useState({
    durationStatus: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchRegistrationDurationStatus = () => {
      getRequest(
        "registration/is_registration_duration",
        (data) => {
          setReportState({
            durationStatus: data.registrationStatus,
            isLoading: false,
            error: null,
          });
          console.log(reportState);
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

    fetchRegistrationDurationStatus();
  }, []);

  useEffect(() => {
    if (!reportState.isLoading && reportState.durationStatus === 0) {
      if (!disable) {
        alert("해당 기간이 아닙니다. 기간을 다시 확인해주세요.");
        navigate(-1);
      }
    }
  }, [reportState.isLoading]);

  return reportState;
};
