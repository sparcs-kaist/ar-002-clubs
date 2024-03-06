const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  sequelize,
  Registration,
  RegistrationType,
  RegistrationActivity,
  Semester,
  RegistrationEvidence,
  RegistrationSign,
  RegistrationFeedback,
} = require("../models");
const schedule = require("node-schedule");
const checkPermission = require("../utils/permission");

const formatSignTime = (signTime) => {
  if (!signTime) return null;
  const date = new Date(signTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-11 -> 1-12
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}.${month.toString().padStart(2, "0")}.${day
    .toString()
    .padStart(2, "0")}. ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

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
      order: [["feedback_type", "ASC"]],
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

router.post("/feedback", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    const { id, reviewResult } = req.body;
    const studentId = req.session.user.student_id;
    const currentTimePlusNineHours = new Date(
      new Date().getTime() + 9 * 60 * 60 * 1000
    );

    // Update feedback_type in Activity based on reviewResult
    const feedbackType = !reviewResult ? 2 : reviewResult === "" ? 2 : 3;
    await Registration.update(
      {
        feedback_type: feedbackType,
        recent_feedback: currentTimePlusNineHours,
      },
      { where: { id } }
    );

    // Save a new record in ActivityFeedback
    await RegistrationFeedback.create({
      registration: id,
      student_id: studentId,
      added_time: currentTimePlusNineHours,
      feedback: reviewResult ? reviewResult : "",
    });

    res.status(200).send("Feedback processed successfully.");
  } catch (error) {
    console.error("Error in /feedback route:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/get_registration", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID query parameter is required",
    });
  }

  try {
    const registration = await Registration.findByPk(id, {
      include: [
        {
          model: RegistrationEvidence,
          as: "RegistrationEvidences", // 모델 정의에 따른 alias 사용
          attributes: [
            "image_url",
            "description",
            "registration_evidence_type",
          ],
        },
        {
          model: RegistrationActivity,
          as: "RegistrationActivities", // 모델 정의에 따른 alias 사용
          attributes: [
            "id",
            "title",
            "activity_type_id",
            "start_date",
            "end_date",
            "feedback_type",
          ],
        },
        {
          model: RegistrationSign,
          as: "RegistrationSigns",
          attributes: ["sign_type"],
        },
        {
          model: RegistrationFeedback,
          as: "RegistrationFeedbacks",
          attributes: ["added_time", "feedback"],
        },
      ],
      attributes: [
        "type_id",
        "club_id",
        "student_id",
        "prev_name",
        "current_name",
        "founding_month",
        "founding_year",
        "phone_number",
        "division",
        "is_advisor",
        "advisor_name",
        "advisor_email",
        "advisor_level",
        "characteristic_kr",
        "characteristic_en",
        "division_consistency",
        "purpose",
        "main_plan",
        "advisor_plan",
      ],
    });

    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    console.log(registration.RegistrationEvidences);

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }
    console.log(registration.RegistrationEvidences);

    const formattedRegistration = {
      typeId: registration.type_id,
      prevName: registration.prev_name,
      currentName: registration.current_name,
      phoneNumber: registration.phone_number,
      foundingYear: registration.founding_year,
      foundingMonth: registration.founding_month,
      division: registration.division,
      isSelectiveAdvisor: registration.is_advisor === 1 ? true : false, // 예시로, DB에서는 0 또는 1로 저장될 수 있습니다.
      advisorName: registration.advisor_name,
      advisorEmail: registration.advisor_email,
      advisorLevel: registration.advisor_level,
      characteristicKr: registration.characteristic_kr,
      characteristicEn: registration.characteristic_en,
      divisionConsistency: registration.division_consistency,
      purpose: registration.purpose,
      mainPlan: registration.main_plan,
      activityReport: registration.RegistrationActivities
        ? registration.RegistrationActivities
        : [],
      activityPlan: registration.RegistrationEvidences
        ? registration.RegistrationEvidences.filter(
            (e) => e.registration_evidence_type === 1
          ).map((e) => ({
            imageUrl: e.image_url,
            fileName: e.description,
          }))
        : [],
      regulation: registration.RegistrationEvidences
        ? registration.RegistrationEvidences.filter(
            (e) => e.registration_evidence_type === 2
          ).map((e) => ({
            imageUrl: e.image_url,
            fileName: e.description,
          }))
        : [],
      externalTeacher: registration.RegistrationEvidences
        ? registration.RegistrationEvidences.filter(
            (e) => e.registration_evidence_type === 3
          ).map((e) => ({
            imageUrl: e.image_url,
            fileName: e.description,
          }))
        : [],
      advisorPlan: registration.advisor_plan,
      representativeSignature: registration.RegistrationSigns.some(
        (sign) => sign.sign_type === 1
      ),
      feedbackResults: registration.RegistrationFeedbacks
        ? registration.RegistrationFeedbacks.filter(
            (feedback) => feedback.feedback.trim() !== ""
          ) // Exclude empty feedback
            .map((feedback) => {
              return {
                feedbackTime: formatSignTime(feedback.added_time),
                text: feedback.feedback,
                // reviewerName: feedback.student.name, // assuming you want to include the name of the reviewer
              };
            })
        : [],
    };

    res.json({ success: true, data: formattedRegistration });
  } catch (error) {
    console.error("Error fetching registration:", error);
    res.status(500).json({ success: false, message: "Server error occurred" });
  }
});

module.exports = router;
