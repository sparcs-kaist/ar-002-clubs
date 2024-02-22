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
  ActivityMember,
  Activity,
  Member,
  Semester,
  Funding,
  FundingEvidence,
  FundingFixture,
  FundingNoncorp,
  FundingTransportation,
  FundingTransportationMember,
  FundingFeedback,
} = require("../models");
const checkPermission = require("../utils/permission");
const { checkRegistrationDuration } = require("../utils/duration");

router.get("/is_registration_duration", async (req, res) => {
  console.log("duration");
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
