const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Sequelize,
  ActivitySign,
  Semester,
  Club,
  SemesterClub,
  Duration,
  Activity,
  ActivityFeedback,
  ActivityEvidence,
  ActivityFeedbackExecutive,
  ActivityMember,
  Activity_init,
  ActivityEvidence_init,
  ActivityMember_init,
  ExecutiveMember,
  Member,
  MemberClub,
} = require("../models");
const schedule = require("node-schedule");
const checkPermission = require("../utils/permission");
const checkReportDuration = require("../utils/duration");

const BATCH_SIZE = 100; // 한 번에 처리할 데이터의 양

router.get("/migrate", async (req, res) => {
  await migrateDataInBatches();
  res.send("finish");
});

router.post("/feedback", async (req, res) => {
  try {
    const { activity_id, reviewResult } = req.body;
    const studentId = req.session.user.student_id;
    const currentTimePlusNineHours = new Date(
      new Date().getTime() + 9 * 60 * 60 * 1000
    );

    // Update feedback_type in Activity based on reviewResult
    const feedbackType = reviewResult === "" ? 2 : 3;
    await Activity.update(
      {
        feedback_type: feedbackType,
        recent_feedback: currentTimePlusNineHours,
      },
      { where: { id: activity_id } }
    );

    // Save a new record in ActivityFeedback
    await ActivityFeedback.create({
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

    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
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

    console.log(105);

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

router.get("/my_feedback_activity", async (req, res) => {
  try {
    const studentId = req.session.user.student_id;

    // Find activities associated with the current user
    const feedbackExecutives = await ActivityFeedbackExecutive.findAll({
      where: { student_id: studentId },
      include: [
        {
          model: Activity,
          as: "activity_Activity", // Use the correct alias as defined in your model association
          include: [
            {
              model: Club,
              as: "club", // Assuming 'Club' is the alias used in the Activity-Club association
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    const responseArray = await Promise.all(
      feedbackExecutives.map(async (feedbackExecutive) => {
        const activity = feedbackExecutive.activity_Activity;

        // Check if activity and club are defined
        const clubName =
          activity && activity.club ? activity.club.name : "Unknown Club";
        const activityName = activity ? activity.title : "Unknown Activity";
        const feedbackTypeId = activity ? activity.feedback_type : null;

        // Fetch feedback details
        const feedbackDetail = await ActivityFeedback.findOne({
          where: { activity: activity ? activity.id : null },
          include: [
            {
              model: Member,
              attributes: ["name"],
              as: "student",
            },
          ],
        });

        console.log(feedbackDetail);
        // Check if feedbackDetail and Member are defined
        const feedbackMemberName =
          feedbackDetail && feedbackDetail.student
            ? feedbackDetail.student.name
            : null;

        // Fetch executive details
        const executiveMember = await Member.findByPk(studentId);

        return {
          activityId: activity ? activity.id : null,
          clubName,
          activityName,
          feedbackMemberName,
          executiveMemberName: executiveMember
            ? executiveMember.name
            : "Unknown Executive",
          feedbackType: feedbackTypeId,
        };
      })
    );

    responseArray.sort((a, b) => {
      if (a.feedbackType < b.feedbackType) {
        return -1;
      }
      if (a.feedbackType > b.feedbackType) {
        return 1;
      }
      return 0;
    });

    res.json(responseArray);
  } catch (error) {
    console.error("Error in your_api_endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/update_executive", async (req, res) => {
  const { student_id, club_id } = req.body;

  try {
    const today = new Date();

    // Find current semester
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Sequelize.Op.lte]: today },
        end_date: { [Sequelize.Op.gte]: today },
      },
    });

    if (!currentSemester) {
      return res.status(404).send("Current semester not found.");
    }

    // Fetch the activity duration for the current semester
    const activityDuration = await Duration.findOne({
      where: {
        semester_id: currentSemester.id,
        duration_name: "Activity",
      },
      attributes: ["start_date", "end_date"],
    });

    if (!activityDuration) {
      return res
        .status(404)
        .send("Activity duration not found for the current semester.");
    }

    // Fetch filtered activities
    const filteredActivities = await Activity.findAll({
      where: {
        club_id: club_id,
        [Sequelize.Op.and]: [
          { start_date: { [Sequelize.Op.gte]: activityDuration.start_date } },
          { end_date: { [Sequelize.Op.lte]: activityDuration.end_date } },
        ],
      },
      attributes: ["id"],
    });

    // Update ActivityFeedbackExecutive for each activity
    for (const activity of filteredActivities) {
      await ActivityFeedbackExecutive.upsert({
        activity: activity.id,
        student_id: student_id,
      });
    }

    res.send("Executive updated successfully.");
  } catch (error) {
    console.error("Error in /update_executive:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/activity_submit_list", async (req, res) => {
  try {
    const today = new Date();

    // 현재 날짜를 포함하는 학기 찾기
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Sequelize.Op.lte]: today },
        end_date: { [Sequelize.Op.gte]: today },
      },
    });

    // Find the 'Activity' duration for the current semester
    // Fetch the activity duration for the current semester
    const activityDuration = await Duration.findOne({
      where: {
        semester_id: currentSemester.id,
        duration_name: "Activity",
      },
      attributes: ["start_date", "end_date"], // Select only the columns that exist
    });

    if (!activityDuration) {
      return res
        .status(404)
        .send("Activity duration not found for the current semester.");
    }

    // 전체 활동 개수 및 feedbackType이 1이 아닌 활동의 개수 조회
    // Fetch all activities within the activity duration range
    const filteredActivities = await Activity.findAll({
      where: {
        [Sequelize.Op.and]: [
          { start_date: { [Sequelize.Op.gte]: activityDuration.start_date } },
          { end_date: { [Sequelize.Op.lte]: activityDuration.end_date } },
        ],
      },
    });

    // Compute total activities and non-feedback type one activities
    const totalActivities = filteredActivities.length;
    const nonFeedbackTypeOneActivities = filteredActivities.filter(
      (activity) => activity.feedback_type !== 1
    ).length;

    // 비율 계산
    const ratio = (nonFeedbackTypeOneActivities / totalActivities) * 100;

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

    const findMostFrequentExecutive = async (clubId) => {
      const activities = await Activity.findAll({
        where: {
          club_id: clubId,
          [Sequelize.Op.and]: [
            Sequelize.where(Sequelize.col("start_date"), {
              [Sequelize.Op.gte]: activityDuration.start_date,
            }),
            Sequelize.where(Sequelize.col("end_date"), {
              [Sequelize.Op.lte]: activityDuration.end_date,
            }),
          ],
        },
        attributes: ["id"],
      });
      const activityIds = activities.map((a) => a.id);

      const executives = await ActivityFeedbackExecutive.findAll({
        where: { activity: activityIds },
        attributes: ["student_id"],
        group: ["student_id"],
        order: [[Sequelize.fn("COUNT", Sequelize.col("student_id")), "DESC"]],
        limit: 1,
      });

      if (executives.length === 0)
        return { executive_id: null, executive: null };
      const mostFrequentStudentId = executives[0].student_id;

      const executiveMember = await Member.findByPk(mostFrequentStudentId);
      return {
        executive_id: mostFrequentStudentId,
        executive: executiveMember ? executiveMember.name : null,
      };
    };

    // SemesterClub에서 type_id가 1인 club_id들을 찾기
    const semesterClubs = await SemesterClub.findAll({
      where: { type_id: 1, semester_id: currentSemester.id },
      attributes: ["club_id", "advisor"],
    });
    const clubData = await Promise.all(
      semesterClubs.map(async (sc) => {
        const club = await Club.findByPk(sc.club_id);

        // Filter activities for this specific club
        const clubActivities = filteredActivities.filter(
          (activity) => activity.club_id === sc.club_id
        );

        // Feedback type calculation
        const feedbackTypesCount = clubActivities.reduce((acc, activity) => {
          acc[activity.feedback_type] = (acc[activity.feedback_type] || 0) + 1;
          return acc;
        }, {});

        // Advisor signature check
        let advisorStatus = sc.advisor ? "서명 미완료" : "선택적 지도교수";
        const latestSign = await ActivitySign.findOne({
          where: { club_id: sc.club_id },
          order: [["sign_time", "DESC"]],
        });

        if (latestSign) {
          advisorStatus = formatSignTime(latestSign.sign_time);
        }

        const { executive_id, executive } = await findMostFrequentExecutive(
          sc.club_id
        );

        return {
          clubId: club.id,
          clubName: club.name,
          feedbackTypeOne: feedbackTypesCount[1] || 0,
          feedbackTypeTwo: feedbackTypesCount[2] || 0,
          feedbackTypeThree: feedbackTypesCount[3] || 0,
          totalClubActivities: clubActivities.length,
          advisorStatus,
          executive_id,
          executive,
        };
      })
    );

    res.json({
      totalActivities,
      nonFeedbackTypeOneActivities,
      ratio,
      clubData,
    });
  } catch (error) {
    console.error("Error in /activity_submit_list:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/club_executive", async (req, res) => {
  try {
    const clubId = req.query.club_id;
    const today = new Date();

    // 현재 날짜를 포함하는 학기 찾기
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Sequelize.Op.lte]: today },
        end_date: { [Sequelize.Op.gte]: today },
      },
    });
    // console.log(currentSemester);

    if (!currentSemester) {
      return res.status(404).send("Current semester not found");
    }

    // 현재 활동중인 집행부원 찾기
    const executiveMembers = await ExecutiveMember.findAll({
      where: {
        start_term: { [Sequelize.Op.lte]: today },
        [Op.or]: [
          { end_term: { [Sequelize.Op.gte]: today } },
          { end_term: null },
        ],
      },
      include: [
        {
          model: Member,
          as: "student",
          attributes: ["student_id", "name"],
        },
      ],
    });

    // console.log(executiveMembers);

    // 특정 동아리에 속하지 않는 집행부원 필터링
    const nonClubExecutives = await Promise.all(
      executiveMembers.map(async (executive) => {
        const isClubMember = await MemberClub.findOne({
          where: {
            student_id: executive.student_id,
            club_id: clubId,
            semester_id: currentSemester.id,
          },
        });

        if (!isClubMember) {
          return {
            student_id: executive.student_id,
            name: executive.student.name,
          };
        }
      })
    );

    // Null 값 제거
    const filteredExecutives = nonClubExecutives.filter(
      (executive) => executive != null
    );

    res.json(filteredExecutives);
  } catch (error) {
    console.error("Error in /club_executive:", error);
    res.status(500).send("Internal Server Error");
  }
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
