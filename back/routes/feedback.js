const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Semester,
  Duration,
  Activity,
  ActivityEvidence,
  ActivityMember,
  Activity_init,
  ActivityEvidence_init,
  ActivityMember_init,
} = require("../models");
const schedule = require("node-schedule");

const BATCH_SIZE = 100; // 한 번에 처리할 데이터의 양

router.get("/migrate", async (req, res) => {
  await migrateDataInBatches();
  res.send("finish");
});

const migrateDataInBatches = async () => {
  try {
    await Activity_init.destroy({ where: {} });
    await ActivityMember_init.destroy({ where: {} });
    await ActivityEvidence_init.destroy({ where: {} });

    // Activity 데이터 이동
    const totalActivities = await Activity.count();
    const activityIterations = Math.ceil(totalActivities / BATCH_SIZE);

    for (let i = 0; i < activityIterations; i++) {
      const activities = await Activity.findAll({
        limit: BATCH_SIZE,
        offset: i * BATCH_SIZE,
      });

      const activityData = activities.map((a) => a.get({ plain: true }));
      await Activity_init.bulkCreate(activityData, { ignoreDuplicates: true });
    }

    // ActivityMember 데이터 이동
    const totalMembers = await ActivityMember.count();
    const memberIterations = Math.ceil(totalMembers / BATCH_SIZE);

    for (let i = 0; i < memberIterations; i++) {
      const members = await ActivityMember.findAll({
        limit: BATCH_SIZE,
        offset: i * BATCH_SIZE,
      });

      const memberData = members.map((m) => m.get({ plain: true }));
      await ActivityMember_init.bulkCreate(memberData, {
        ignoreDuplicates: true,
      });
    }

    // ActivityEvidence 데이터 이동
    const totalEvidence = await ActivityEvidence.count();
    const evidenceIterations = Math.ceil(totalEvidence / BATCH_SIZE);

    for (let i = 0; i < evidenceIterations; i++) {
      const evidence = await ActivityEvidence.findAll({
        limit: BATCH_SIZE,
        offset: i * BATCH_SIZE,
      });

      const evidenceData = evidence.map((e) => e.get({ plain: true }));
      await ActivityEvidence_init.bulkCreate(evidenceData, {
        ignoreDuplicates: true,
      });
    }

    console.log("Data migration completed successfully");
  } catch (error) {
    console.error("Error during batch data migration:", error);
  }
};

const scheduleReportModifyStart = async () => {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 9);

  const currentSemester = await Semester.findOne({
    where: {
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
    },
  });

  if (!currentSemester) {
    console.log("현재 학기를 찾을 수 없습니다.");
    return;
  }

  const durations = await Duration.findAll({
    where: {
      semester_id: currentSemester.id,
      duration_name: "ReportModify",
    },
    attributes: ["start_date"],
  });

  if (durations.length > 0) {
    const reportModifyStartDate = new Date(durations[0].start_date);
    // reportModifyStartDate.setHours(-30, -7, 0, 0); // 시작일의 자정에 설정
    reportModifyStartDate.setHours(0, 0, 0, 0); // 시작일의 자정에 설정

    schedule.scheduleJob(reportModifyStartDate, async function () {
      // 여기에 실행할 함수를 넣습니다.
      console.log("ReportModify 시작!");
      await migrateDataInBatches();
      // 실행할 함수 또는 로직
    });
  }
};

scheduleReportModifyStart();

module.exports = router;
