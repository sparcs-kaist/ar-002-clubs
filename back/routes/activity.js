const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const {
  sequelize,
  MemberClub,
  Member,
  Semester,
  Duration,
  Activity,
  ActivityType,
  ActivityEvidence,
  ActivityMember,
  ActivitySign,
  ActivityEvidence_init,
  Activity_init,
  ActivityMember_init,
  ActivityFeedback,
} = require("../models");
const checkPermission = require("../utils/permission");
const { checkReportDuration } = require("../utils/duration");

// Configure AWS with your access and secret key.
// These should be stored in environment variables for security.
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

// Configure multer-s3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "ar-002-clubs",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const timestamp = new Date().toISOString().replace(/:/g, "-");
      const encodedFileName = file.originalname;
      cb(null, `uploads/${timestamp}_${encodedFileName}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post("/advisor_sign", async (req, res) => {
  const { clubId: club_id } = req.body;

  try {
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    const signTime = new Date();
    signTime.setHours(signTime.getHours() + 9); // UTC+9로 조정

    await ActivitySign.create({
      semester_id: currentSemester.id,
      club_id: club_id,
      sign_time: signTime,
    });

    res.json({ success: true, message: "Advisor sign recorded successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/advisor_sign", async (req, res) => {
  const { club_id } = req.query;

  try {
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    const latestSign = await ActivitySign.findOne({
      where: {
        club_id,
        semester_id: currentSemester.id,
      },
      order: [["sign_time", "DESC"]],
    });

    const latestEdit = await Activity_init.findOne({
      where: {
        club_id,
        recent_edit: {
          [Op.between]: [currentSemester.start_date, currentSemester.end_date],
        },
      },
      order: [["recent_edit", "DESC"]],
    });

    const signed =
      latestSign &&
      (!latestEdit || latestSign.sign_time > latestEdit.recent_edit);

    res.json({ signed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/deleteActivity/:activityId", async (req, res) => {
  const durationCheck = await checkReportDuration();
  if (!durationCheck.found || durationCheck.reportStatus !== 1) {
    return res.status(400).send({ message: "활동 추가 기한이 지났습니다." });
  }

  const { activityId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const activity = await Activity.findByPk(activityId);
    const authorized = await checkPermission(req, res, [
      { club_rep: 4, club_id: activity.club_id },
    ]);
    if (!authorized) {
      return;
    }

    // Delete from ActivityEvidence
    await ActivityEvidence.destroy({
      where: { activity_id: activityId },
      transaction,
    });

    // Delete from ActivityMember
    await ActivityMember.destroy({
      where: { activity_id: activityId },
      transaction,
    });

    // Delete from Activity
    await Activity.destroy({
      where: { id: activityId },
      transaction,
    });

    await transaction.commit();
    res
      .status(200)
      .send({ message: "Activity and related data deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting activity:", error);
    res.status(500).send("Error deleting activity");
  }
});

router.post("/addActivity", async (req, res) => {
  const durationCheck = await checkReportDuration();
  if (!durationCheck.found || durationCheck.reportStatus !== 1) {
    return res.status(400).send({ message: "활동 추가 기한이 지났습니다." });
  }

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

  const authorized = await checkPermission(req, res, [
    { club_rep: 4, club_id: clubId },
  ]);
  if (!authorized) {
    return;
  }

  try {
    // const existingActivitiesCount = await Activity.count({
    //   where: { club_id: clubId },
    // });

    // // If there are already 20 or more activities, do not proceed
    // if (existingActivitiesCount >= 20) {
    //   return res
    //     .status(400)
    //     .send({ message: "Cannot add more than 20 activities." });
    // }

    // Calculate the current date/time in KST (Korean Standard Time)
    const currentDateTimeUTC = new Date();
    const kstOffset = 9 * 60; // 9 hours in minutes
    currentDateTimeUTC.setMinutes(currentDateTimeUTC.getMinutes() + kstOffset);

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
      recent_edit: currentDateTimeUTC,

      // Add any other fields you need to save
    });

    // Inside your route for adding or editing an activity
    await Promise.all(
      proofImages.map((image) => {
        return ActivityEvidence.create({
          activity_id: activity.id,
          image_url: image.imageUrl,
          description: image.fileName,
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

router.post("/editActivity", async (req, res) => {
  const {
    activityId, // Added this line to handle existing activity ID
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

  const transaction = await sequelize.transaction();

  // Calculate the current date/time in KST (Korean Standard Time)
  const currentDateTimeUTC = new Date();
  const kstOffset = 9 * 60; // 9 hours in minutes
  currentDateTimeUTC.setMinutes(currentDateTimeUTC.getMinutes() + kstOffset);

  try {
    let activity;
    if (activityId) {
      // Update existing activity
      activity = await Activity.findByPk(activityId);
      const authorized = await checkPermission(req, res, [
        { club_rep: 4, club_id: activity.club_id },
      ]);
      if (!authorized) {
        return;
      }
      await activity.update(
        {
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
          recent_edit: currentDateTimeUTC,
        },
        { transaction }
      );

      // Delete existing evidence and participants
      await ActivityEvidence.destroy({
        where: { activity_id: activityId },
        transaction,
      });
      await ActivityMember.destroy({
        where: { activity_id: activityId },
        transaction,
      });
    } else {
      // Create new activity
      activity = await Activity.create(
        {
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
        },
        { transaction }
      );
    }

    // Add new evidence and participants
    await Promise.all(
      proofImages.map((image) =>
        ActivityEvidence.create(
          {
            activity_id: activity.id,
            image_url: image.imageUrl,
            description: image.fileName,
          },
          { transaction }
        )
      )
    );
    await Promise.all(
      participants.map((participant) =>
        ActivityMember.create(
          {
            activity_id: activity.id,
            member_student_id: participant.student_id,
          },
          { transaction }
        )
      )
    );

    await transaction.commit();
    res.status(200).send({
      message: "Activity updated successfully",
      activityId: activity.id,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating activity:", error);
    res.status(500).send("Error updating activity");
  }
});

router.get("/getActivity/:activityId", async (req, res) => {
  const durationCheck = await checkReportDuration();
  // if (!durationCheck.found || durationCheck.reportStatus !== 1) {
  //   return res.status(400).send({ message: "활동 추가 기한이 지났습니다." });
  // }
  const { activityId } = req.params;

  try {
    let activity;
    let evidence;
    let participants;

    // Fetch activity details
    activity = await Activity.findByPk(activityId);
    if (!activity) {
      return res.status(404).send("Activity not found");
    }

    const authorized = await checkPermission(req, res, [
      { club_rep: 4, club_id: activity.club_id },
      { advisor: activity.club_id },
      // { executive: 4 },
    ]);
    if (!authorized) {
      return;
    }

    const isAdvisor = authorized.some((auth) => auth.hasOwnProperty("advisor"));

    if (durationCheck.reportStatus === 2 && isAdvisor) {
      activity = await Activity_init.findByPk(activityId);
      evidence = await ActivityEvidence_init.findAll({
        where: { activity_id: activityId },
      });
      participants = await ActivityMember_init.findAll({
        where: { activity_id: activityId },
        include: [
          {
            model: Member,
            attributes: ["name"],
            as: "member_student",
          },
        ],
      });
    } else {
      activity = await Activity.findByPk(activityId);
      evidence = await ActivityEvidence.findAll({
        where: { activity_id: activityId },
      });
      participants = await ActivityMember.findAll({
        where: { activity_id: activityId },
        include: [
          {
            model: Member,
            attributes: ["name"],
            as: "member_student",
          },
        ],
      });
    }

    // Function to extract the timestamp from the S3 URL
    const extractTimestamp = (url) => {
      const matches = url.match(
        /uploads\/(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/
      );
      return matches ? new Date(matches[1].replace(/-/g, ":")) : new Date();
    };

    // Sort evidence by the extracted timestamp
    evidence.sort((a, b) => {
      const timestampA = extractTimestamp(a.image_url);
      const timestampB = extractTimestamp(b.image_url);
      return timestampA - timestampB;
    });

    const feedbacks = await ActivityFeedback.findAll({
      where: { activity: activityId },
      include: [
        {
          model: Member,
          attributes: ["name"],
          as: "student",
        },
      ],
    });

    // Filter and format feedback results
    const feedbackResults = feedbacks
      .filter((feedback) => feedback.feedback.trim() !== "") // Exclude empty feedback
      .map((feedback) => {
        return {
          addedTime: feedback.added_time,
          text: feedback.feedback,
          reviewerName: feedback.student.name, // assuming you want to include the name of the reviewer
        };
      });

    // Format the response
    const response = {
      clubId: activity.club_id,
      name: activity.title,
      type: activity.activity_type_id,
      startDate: activity.start_date,
      endDate: activity.end_date,
      location: activity.location,
      purpose: activity.purpose,
      content: activity.content,
      proofText: activity.proof_text,
      participants: participants.map((p) => ({
        student_id: p.member_student_id,
        name: p.member_student.name,
      })),
      proofImages: evidence.map((e) => ({
        imageUrl: e.image_url,
        fileName: e.description,
      })),
      feedbackResults, // Adjust based on how you store 'feedbackResults'
    };

    res.status(200).send(response);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).send("Error fetching activity");
  }
});

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    // Check if file is available
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Send a response with file details
    res.send({
      message: "File uploaded successfully",
      fileDetails: req.file,
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
    const durationCheck = await checkReportDuration();

    if (!durationCheck.found) {
      return res.status(404).json({ message: durationCheck.message });
    }

    res.json({ reportStatus: durationCheck.reportStatus });
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/activity_list", async (req, res) => {
  const clubId = req.query.club_id;
  const isAdvisor = req.query.is_advisor === 1;
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
        ...(isAdvisor
          ? {
              start_date: { [Op.gte]: activityDuration.start_date },
              end_date: { [Op.lte]: activityDuration.end_date },
            }
          : {}),
      },
      include: [
        {
          model: ActivityType,
          as: "activity_type",
          attributes: ["type"],
        },
      ],
      attributes: [
        "id",
        "title",
        "activity_type_id",
        "start_date",
        "end_date",
        "feedback_type",
      ],
      order: [["recent_edit", "DESC"]],
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
        id: activity.id,
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
  const {
    club_id: clubId,
    query,
    start_date: startDate,
    end_date: endDate,
  } = req.query;
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

    // startDate가 주어진 경우, 해당 날짜를 기준으로 추가 조건 설정
    let semesterConditions;
    if (
      startDate &&
      new Date(startDate) < new Date(currentSemester.start_date)
    ) {
      if (endDate && new Date(endDate) < new Date(currentSemester.start_date)) {
        semesterConditions = {
          [Op.or]: [{ semester_id: currentSemester.id - 1 }],
        };
      } else {
        // startDate가 currentSemester.start_date보다 빠른 경우, 이전 학기도 포함
        semesterConditions = {
          [Op.or]: [
            { semester_id: currentSemester.id },
            { semester_id: currentSemester.id - 1 },
          ],
        };
      }
    } else {
      // 그렇지 않은 경우, 현재 학기만 고려
      semesterConditions = { semester_id: currentSemester.id };
    }

    // 해당 동아리에 속한 회원들 조회
    const members = await MemberClub.findAll({
      where: {
        club_id: clubId,
        ...semesterConditions,
      },
      attributes: ["student_id"],
    });

    const memberNames = await Promise.all(
      members.map(async (memberClub) => {
        const member = await Member.findOne({
          where: { student_id: memberClub.student_id },
          attributes: ["name"],
        });
        return { student_id: memberClub.student_id, name: member.name };
      })
    );

    const seenIds = new Set();
    const filteredMembers = memberNames.filter((member) => {
      const duplicate = seenIds.has(member.student_id);
      seenIds.add(member.student_id);
      return (
        !duplicate && member.name.toLowerCase().includes(query.toLowerCase())
      );
    });

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
