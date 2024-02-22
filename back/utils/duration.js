const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const {
  ClubRepresentative,
  SemesterClub,
  ExecutiveMember,
  Semester,
  Duration,
} = require("../models");

async function checkReportDuration() {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 9);

  const currentSemester = await Semester.findOne({
    where: {
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  if (!currentSemester) {
    return { found: false, message: "현재 학기를 찾을 수 없습니다." };
  }

  const durations = await Duration.findAll({
    where: {
      semester_id: currentSemester.id,
      duration_name: { [Op.or]: ["ActivityReport", "ActivityModify"] },
    },
    attributes: ["duration_name", "start_date", "end_date"],
  });

  let responseCode = 0;
  durations.forEach((duration) => {
    const startDate = new Date(duration.start_date);
    const endDate = new Date(duration.end_date);
    endDate.setHours(32, 59, 59, 999);

    console.log(startDate);
    console.log(endDate);
    console.log(currentDate);

    if (
      duration.duration_name === "ActivityReport" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 1;
    } else if (
      duration.duration_name === "ActivityModify" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 2;
    }
  });

  return { found: true, reportStatus: responseCode };
}

async function checkFundingDuration() {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 9);

  const currentSemester = await Semester.findOne({
    where: {
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  if (!currentSemester) {
    return { found: false, message: "현재 학기를 찾을 수 없습니다." };
  }

  const durations = await Duration.findAll({
    where: {
      semester_id: currentSemester.id,
      duration_name: { [Op.or]: ["FundingReport", "FundingModify"] },
    },
    attributes: ["duration_name", "start_date", "end_date"],
  });

  let responseCode = 0;
  durations.forEach((duration) => {
    const startDate = new Date(duration.start_date);
    const endDate = new Date(duration.end_date);
    endDate.setHours(32, 59, 59, 999);

    console.log(startDate);
    console.log(endDate);
    console.log(currentDate);

    if (
      duration.duration_name === "FundingReport" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 1;
    } else if (
      duration.duration_name === "FundingModify" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 2;
    }
  });

  return { found: true, fundingStatus: responseCode };
}

async function checkRegistrationDuration() {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 9);

  const currentSemester = await Semester.findOne({
    where: {
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  if (!currentSemester) {
    return { found: false, message: "현재 학기를 찾을 수 없습니다." };
  }

  const durations = await Duration.findAll({
    where: {
      semester_id: currentSemester.id,
      duration_name: { [Op.or]: ["ClubRegistration", "MemberRegistration"] },
    },
    attributes: ["duration_name", "start_date", "end_date"],
  });

  let responseCode = 0;
  durations.forEach((duration) => {
    const startDate = new Date(duration.start_date);
    const endDate = new Date(duration.end_date);
    endDate.setHours(32, 59, 59, 999);

    console.log(startDate);
    console.log(endDate);
    console.log(currentDate);

    if (
      duration.duration_name === "ClubRegistration" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 1;
    } else if (
      duration.duration_name === "MemberRegistration" &&
      currentDate >= startDate &&
      currentDate <= endDate
    ) {
      responseCode = 2;
    }
  });

  return { found: true, registrationStatus: responseCode };
}

module.exports = {
  checkReportDuration,
  checkFundingDuration,
  checkRegistrationDuration,
};
