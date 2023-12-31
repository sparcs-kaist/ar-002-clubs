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
      duration_name: { [Op.or]: ["Report", "ReportModify"] },
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

  return { found: true, reportStatus: responseCode };
}

module.exports = checkReportDuration;
