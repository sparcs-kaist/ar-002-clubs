const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Club,
  ClubRepresentative,
  Semester,
  Duration,
  Activity,
  ActivityType,
} = require("../models");

router.get("/is_report_duration", async (req, res) => {
  try {
    const currentDate = new Date();

    // 현재 날짜를 포함하는 학기 찾기
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res.status(404).json({ message: "현재 학기를 찾을 수 없습니다." });
    }

    // 'Report' 및 'ReportModify' 기간 찾기
    const durations = await Duration.findAll({
      where: {
        semester_id: currentSemester.id,
        duration_name: { [Op.or]: ["Report", "ReportModify"] },
      },
      attributes: ["duration_name", "start_date", "end_date", "semester_id"], // 'id' 열 제외
    });

    // 기간 확인
    let responseCode = 0;
    durations.forEach((duration) => {
      const startDate = new Date(duration.start_date);
      const endDate = new Date(duration.end_date);

      if (
        duration.duration_name === "Report" &&
        currentDate >= startDate &&
        currentDate <= endDate
      ) {
        responseCode = 1;
      } else if (
        duration.duration_name === "ReportModify" &&
        currentDate >= startDate &&
        currentDate <= endDate
      ) {
        responseCode = 2;
      }
    });
    res.json({ reportStatus: responseCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/activity_list", async (req, res) => {
  const clubId = req.query.club_id;
  const currentDate = new Date();

  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }

  try {
    // Find current semester
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res.status(404).json({
        success: false,
        message: "Current semester not found",
      });
    }

    // Find the 'Activity' duration
    const activityDuration = await Duration.findOne({
      where: {
        duration_name: "Activity",
        semester_id: currentSemester.id,
      },
      attributes: ["duration_name", "start_date", "end_date", "semester_id"],
    });

    if (!activityDuration) {
      return res.status(404).json({
        success: false,
        message: "Activity duration not found for the current semester",
      });
    }

    // Find activities for the club within the duration
    const activities = await Activity.findAll({
      where: {
        club_id: clubId,
        start_date: { [Op.gte]: activityDuration.start_date },
        end_date: { [Op.lte]: activityDuration.end_date },
      },
      include: [
        {
          model: ActivityType,
          as: "activity_type",
          attributes: ["type"],
        },
      ],
      attributes: [
        "title",
        "activity_type_id",
        "start_date",
        "end_date",
        "feedback_type",
      ],
      order: [["start_date", "ASC"]],
    });

    const formatDateString = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}.`;
    };

    res.json({
      success: true,
      activities: activities.map((activity) => ({
        title: activity.title,
        activityType: activity.activity_type.type,
        startDate: formatDateString(activity.start_date),
        endDate: formatDateString(activity.end_date),
        feedbackType: activity.feedback_type,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
