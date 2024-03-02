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
  RegistrationType,
  RegistrationActivity,
  RegistrationActivityEvidence,
  RegistrationActivityMember,
  Semester,
  RegistrationEvidence,
  RegistrationSign,
  ActivityType,
  Club,
  SemesterClub,
} = require("../models");
const checkPermission = require("../utils/permission");
const { checkRegistrationDuration } = require("../utils/duration");

router.get("/registration_list", async (req, res) => {
  const currentDate = new Date();

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

    // Find activities for the club within the duration
    const registrations = await Registration.findAll({
      where: {
        student_id: req.session.user.student_id,
        semester_id: currentSemester.id,
      },
      include: [
        {
          model: RegistrationType,
          as: "type",
          attributes: ["registration_type"],
        },
      ],
      attributes: [
        "id",
        "current_name",
        "type_id",
        "recent_edit",
        "feedback_type",
      ],
      order: [["recent_edit", "ASC"]],
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
      registrations: registrations.map((registration) => ({
        id: registration.id,
        currentName: registration.current_name,
        registrationType: registration.type.registration_type,
        recentEdit: formatDateString(registration.recent_edit),
        feedbackType: registration.feedback_type,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/additional_info", async (req, res) => {
  const clubId = req.query.club_id;
  const currentDate = new Date();

  try {
    // 현재 학기 찾기
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

    // 클럽 정보 찾기
    const clubInfo = await Club.findOne({
      where: { id: clubId },
      attributes: ["name", "founding_year", "division_id"],
    });

    if (!clubInfo) {
      return res
        .status(404)
        .json({ success: false, message: "Club not found" });
    }

    // 현재 학기에 해당하는 클럽의 지도 교수 정보 찾기
    const semesterClubInfo = await SemesterClub.findOne({
      where: {
        club_id: clubId,
        semester_id: currentSemester.id,
      },
      attributes: [
        "advisor",
        "advisor_mail",
        "characteristic_kr",
        "characteristic_en",
      ],
    });

    const isSelectiveAdvisor = semesterClubInfo.advisor ? false : true;
    const advisorName = semesterClubInfo.advisor;
    const advisorEmail = semesterClubInfo.get("advisor_mail");
    const characteristicKr = semesterClubInfo.get("characteristic_kr");
    const characteristicEn = semesterClubInfo.get("characteristic_en");

    // 응답 데이터 구성 및 반환
    res.json({
      success: true,
      data: {
        prevName: clubInfo.name,
        foundingYear: clubInfo.founding_year,
        isSelectiveAdvisor,
        advisorName,
        advisorEmail,
        characteristicKr,
        characteristicEn,
        division: clubInfo.division_id,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/activity_list", async (req, res) => {
  const clubId = req.query.club_id;
  const currentDate = new Date();

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

    // Find activities for the club within the duration
    const activities = await RegistrationActivity.findAll({
      where: {
        club_id: clubId,
        semester_id: currentSemester.id,
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
      clubId,
      typeId,
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
      activityReport,
    } = req.body;

    // const authorized = await checkPermission(req, res, [
    //   { club_rep: 4, club_id: clubId },
    // ]);
    // if (!authorized) {
    //   return;
    // }
    console.log(req.body);
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
    const semester_id = currentSemester.id;

    const founding_month =
      foundingMonth > 0 && foundingMonth < 13 ? foundingMonth : null;

    // Create a new registration entry
    const registration = await Registration.create(
      {
        club_id: clubId,
        student_id: req.session.user.student_id,
        type_id: typeId,
        feedback_type: 1,
        semester_id,
        prev_name: prevName,
        current_name: currentName,
        founding_month: foundingMonth,
        founding_year: foundingYear,
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
        recent_edit: currentDateTimeUTC,
      },
      { transaction }
    );

    await RegistrationSign.bulkCreate(
      [
        {
          registration: registration.id, // 수정: 'registration' -> 'registration_id'
          sign_type: 1,
          sign_time: currentDateTimeUTC,
        },
      ],
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

  const currentDate = new Date();
  const currentSemester = await Semester.findOne({
    where: {
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

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
      semester_id: currentSemester.id,
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
