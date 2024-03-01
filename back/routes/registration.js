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
  Registration,
  RegistrationActivity,
  RegistrationActivityEvidence,
  RegistrationActivityMember,
  Semester,
  RegistrationEvidence,
} = require("../models");
const checkPermission = require("../utils/permission");
const { checkRegistrationDuration } = require("../utils/duration");

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
        "id",
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

router.post("/add_registration", async (req, res) => {
  try {
    const {
      prevName,
      currentName,
      foundingMonth,
      foundingYear,
      phoneNumber,
      division,
      isAdvisor,
      advisorName,
      advisorEmail,
      advisorLevel,
      characteristicKr,
      characteristicEn,
      divisionConsistency,
      purpose,
      mainPlan,
      activityPlan,
      regulation,
      externalTeacher,
      advisorPlan,
    } = req.body;

    // const authorized = await checkPermission(req, res, [
    //   { club_rep: 4, club_id: clubId },
    // ]);
    // if (!authorized) {
    //   return;
    // }

    const durationCheck = await checkRegistrationDuration();
    if (durationCheck.registrationStatus !== 1) {
      return res.status(400).send({ message: "활동 추가 기한이 지났습니다." });
    }

    const transaction = await sequelize.transaction();

    // Calculate the current date/time in KST (Korean Standard Time)
    const currentDateTimeUTC = new Date();
    const kstOffset = 9 * 60; // 9 hours in minutes
    currentDateTimeUTC.setMinutes(currentDateTimeUTC.getMinutes() + kstOffset);

    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    // Convert isAdvisor to a format suitable for the database (e.g., from boolean to smallint)
    const isAdvisorDb = isAdvisor ? 1 : 0;

    // Assuming club_id, type_id, and semester_id are provided in the request or determined by some logic here
    const club_id = 1;
    const type_id = 1;
    const semester_id = currentSemester.id;

    const foudningDate = foundingMonth + "-01";

    // Create a new registration entry
    const registration = await Registration.create(
      {
        club_id,
        student_id: req.session.user.student_id,
        type_id,
        semester_id,
        prev_name: prevName,
        current_name: currentName,
        founding_month: foundingMonth,
        fouding_year: foundingYear,
        phone_number: phoneNumber,
        division,
        is_advisor: isAdvisorDb,
        advisor_name: advisorName,
        advisor_email: advisorEmail,
        advisor_level: advisorLevel,
        characteristic_kr: characteristicKr,
        characteristic_en: characteristicEn,
        division_consistency: divisionConsistency,
        purpose,
        main_plan: mainPlan,
        advisor_plan: advisorPlan,
        recent_edit: currentDateTimeUTC,
      },
      { transaction }
    );

    // Insert FundingEvidence for transaction images
    await RegistrationEvidence.bulkCreate(
      activityPlan.map((image) => ({
        registration_id: registration.id,
        image_url: image.imageUrl,
        description: image.fileName,
        registration_evidence_type: 1,
      })),
      { transaction }
    );

    // Insert FundingEvidence for transaction images
    await RegistrationEvidence.bulkCreate(
      regulation.map((image) => ({
        registration_id: registration.id,
        image_url: image.imageUrl,
        description: image.fileName,
        registration_evidence_type: 2,
      })),
      { transaction }
    );

    // Insert FundingEvidence for transaction images
    await RegistrationEvidence.bulkCreate(
      externalTeacher.map((image) => ({
        registration_id: registration.id,
        image_url: image.imageUrl,
        description: image.fileName,
        registration_evidence_type: 3,
      })),
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Registration added successfully",
      data: registration,
    });
  } catch (error) {
    console.error("Error adding registration:", error);
    res.status(500).json({ message: "Server error occurred" });
  }
});

router.post("/addActivity", async (req, res) => {
  const durationCheck = await checkRegistrationDuration();
  if (durationCheck.registrationStatus !== 1) {
    console.log("활동 추가 기한이 지났습니다.");
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
    const existingActivitiesCount = await RegistrationActivity.count({
      where: { club_id: clubId },
    });

    // If there are already 20 or more activities, do not proceed
    if (existingActivitiesCount >= 20) {
      return res
        .status(400)
        .send({ message: "Cannot add more than 20 activities." });
    }

    // Calculate the current date/time in KST (Korean Standard Time)
    const currentDateTimeUTC = new Date();
    const kstOffset = 9 * 60; // 9 hours in minutes
    currentDateTimeUTC.setMinutes(currentDateTimeUTC.getMinutes() + kstOffset);

    // Create Activity
    const activity = await RegistrationActivity.create({
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
        return RegistrationActivityEvidence.create({
          activity_id: activity.id,
          image_url: image.imageUrl,
          description: image.fileName,
        });
      })
    );

    // Add Participants
    await Promise.all(
      participants.map((participant) => {
        return RegistrationActivityMember.create({
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

router.get("/is_registration_duration", async (req, res) => {
  // console.log("duration");
  try {
    const durationCheck = await checkRegistrationDuration();

    if (!durationCheck.found) {
      return res.status(404).json({ message: durationCheck.message });
    }

    res.json({ registrationStatus: durationCheck.registrationStatus });
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
