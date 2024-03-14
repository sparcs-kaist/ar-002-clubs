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
  RegistrationActivityFeedback,
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

router.post("/activity_feedback", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    const { activity_id, reviewResult } = req.body;
    const studentId = req.session.user.student_id;
    const currentTimePlusNineHours = new Date(
      new Date().getTime() + 9 * 60 * 60 * 1000
    );

    // Update feedback_type in Activity based on reviewResult
    const feedbackType = reviewResult === "" ? 2 : 3;
    await RegistrationActivity.update(
      {
        feedback_type: feedbackType,
        recent_feedback: currentTimePlusNineHours,
      },
      { where: { id: activity_id } }
    );

    // Save a new record in ActivityFeedback
    await RegistrationActivityFeedback.create({
      activity: activity_id,
      student_id: studentId,
      added_time: currentTimePlusNineHours,
      feedback: reviewResult,
    });

    res.status(200).send("Feedback processed successfully.");
  } catch (error) {
    console.error("Error in /feedback route:", error);
    res.status(500).send("Internal Server Error");
  }
});

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

module.exports = router;
