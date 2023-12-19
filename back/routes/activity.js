const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const {
  MemberClub,
  Member,
  MemberStatus,
  Semester,
  Duration,
  Activity,
  ActivityType,
  ActivityEvidence,
  ActivityMember,
} = require("../models");

// Configure AWS with your access and secret key.
// These should be stored in environment variables for security.
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

router.post("/addActivity", async (req, res) => {
  const {
    clubId,
    name: title,
    type: activityTypeId,
    category,
    startDate,
    endDate,
    location,
    purpose,
    content,
    proofText,
    participants,
    proofImages,
    feedbackResults,
  } = req.body;

  try {
    // Create Activity
    const activity = await Activity.create({
      club_id: clubId,
      title,
      activity_type_id: activityTypeId,
      start_date: startDate,
      end_date: endDate,
      location,
      purpose,
      content,
      proof_text: proofText,
      feedback_type: 1,
      recent_edit: new Date(),

      // Add any other fields you need to save
    });

    // Add Evidence
    await Promise.all(
      proofImages.map((image) => {
        return ActivityEvidence.create({
          activity_id: activity.id,
          image_url: image.imageUrl,
          description: image.fileName, // Assuming description is stored in fileName
        });
      })
    );

    // Add Participants
    await Promise.all(
      participants.map((participant) => {
        return ActivityMember.create({
          activity_id: activity.id,
          member_student_id: participant.student_id,
        });
      })
    );

    res.status(200).send({
      message: "Activity added successfully",
      activityId: activity.id,
    });
  } catch (error) {
    console.error("Error adding activity:", error);
    res.status(500).send("Error adding activity");
  }
});

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    // Check if file is not available
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    // Generate a timestamp
    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const encodedFileName = file.originalname;

    // Set S3 parameters with timestamp and original file name
    const s3Params = {
      Bucket: "ar-002-clubs", // Replace with your S3 bucket name
      Key: `uploads/${timestamp}_${encodedFileName}`, // File name you want to save as
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Adjust the ACL as per your requirements
    };

    // Upload file to S3
    s3.upload(s3Params, (s3Err, data) => {
      if (s3Err) throw s3Err;
      res.send({ message: "File uploaded successfully", data });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error in file upload.");
  }
});

router.get("/image-proxy", async (req, res) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).send("URL parameter is required");
  }

  const bucket = "ar-002-clubs"; // Replace with your bucket name
  const key = decodeURIComponent(new URL(imageUrl).pathname.slice(1));

  try {
    const stream = s3
      .getObject({ Bucket: bucket, Key: key })
      .createReadStream();
    stream.pipe(res);
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    res.status(500).send("Error fetching image");
  }
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

router.post("/deleteImage", async (req, res) => {
  const { fileName } = req.body;
  const key = `uploads/${fileName}`;

  s3.deleteObject(
    {
      Bucket: "ar-002-clubs",
      Key: key,
    },
    (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting file.");
      } else {
        res.send({ message: "File deleted successfully" });
      }
    }
  );
});

router.get("/search_members", async (req, res) => {
  const { club_id: clubId, query } = req.query;
  const currentDate = new Date();

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

module.exports = router;
