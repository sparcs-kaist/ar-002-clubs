const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const {
  MemberClub,
  Member,
  MemberStatus,
  Semester,
  Duration,
  Activity,
  ActivityType,
} = require("../models");

// Configure AWS with your access and secret key.
// These should be stored in environment variables for security.
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2", // Replace with your S3 bucket's region
});

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

router.get("/search_members", async (req, res) => {
  const { club_id: clubId, query } = req.query;
  const currentDate = new Date();

  console.log(query);

  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }

  try {
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

    // 해당 동아리에 속한 회원들 조회
    const members = await MemberClub.findAll({
      where: {
        club_id: clubId,
        semester_id: currentSemester.id,
      },
      include: [
        {
          model: MemberStatus,
          as: "student",
          include: [
            {
              model: Member,
              as: "student",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const filteredMembers = members
      .map((member) => ({
        student_id: member.student_id,
        name: member.student.student.name,
      }))
      .filter((member) =>
        member.name.toLowerCase().includes(query.toLowerCase())
      );

    res.json({
      success: true,
      members: filteredMembers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// POST /file_upload
router.post("/file_upload", (req, res) => {
  const bucketName = "ar-002-clubs"; // Replace with your bucket name
  const key = `uploads/${Date.now()}_${req.body.file_name}`; // File name in S3
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60, // Time in seconds until the pre-signed URL expires
  };

  s3.getSignedUrl("putObject", params, (err, url) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error generating pre-signed URL" });
    }
    res.json({ url, key }); // Send pre-signed URL and file key back to client
  });
});

router.get("/get_file_url", async (req, res) => {
  const key = req.query.key; // The key of the file in S3

  const params = {
    Bucket: "ar-002-clubs",
    Key: key,
    Expires: 600, // URL expires in 60 seconds
  };

  s3.getSignedUrl("getObject", params, (err, url) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Error generating URL" });
    }
    res.json({ url });
  });
});

module.exports = router;
