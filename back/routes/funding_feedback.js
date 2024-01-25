const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Sequelize,
  Semester,
  Club,
  Funding,
  SemesterClub,
  Duration,
  ExecutiveMember,
  Member,
  MemberClub,
} = require("../models");
const schedule = require("node-schedule");
const checkPermission = require("../utils/permission");
const checkReportDuration = require("../utils/duration");

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

router.get("/club_funding_list", async (req, res) => {
  try {
    const club_id = req.query.club_id; // or req.body.club_id, depending on how you're sending the data

    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

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

    // Fetch the activity duration
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
      include: [
        {
          model: ActivityFeedback,
          as: "ActivityFeedbacks", // Alias defined in your associations
          include: [
            {
              model: Member,
              as: "student",
              attributes: ["name"],
            },
          ],
          order: [["added_time", "DESC"]],
          limit: 1,
        },
        {
          model: ActivityFeedbackExecutive,
          as: "ActivityFeedbackExecutive",
          include: [
            {
              model: ExecutiveMember,
              as: "student", // Alias for ExecutiveMember association
              include: [
                {
                  model: Member,
                  as: "student", // Alias for Member association in ExecutiveMember
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
      ],
      order: [["feedback_type", "ASC"]],
      attributes: [
        "id",
        "title",
        "recent_edit",
        "recent_feedback",
        "feedback_type",
      ],
    });

    console.log(
      filteredActivities[0].ActivityFeedbackExecutive.student.student.name
    );

    // Process and return the response
    const responseArray = filteredActivities.map((activity) => {
      const recentFeedback = activity.ActivityFeedbacks[0];
      const executiveFeedback = activity.ActivityFeedbackExecutive;

      return {
        title: activity.title,
        activityId: activity.id,
        recent_edit: formatSignTime(activity.recent_edit),
        recent_feedback: formatSignTime(activity.recent_feedback),
        feedbackMemberName: recentFeedback ? recentFeedback.student.name : null,
        executive_id: executiveFeedback ? executiveFeedback.student_id : null,
        executiveName: executiveFeedback
          ? executiveFeedback.student.student.name
          : null,
        feedbackType: activity.feedback_type,
      };
    });

    // Fetch the club name
    const club = await Club.findByPk(club_id);
    if (!club) {
      return res.status(404).send("Club not found.");
    }
    const clubName = club.name;

    res.json({ clubName, activities: responseArray });
  } catch (error) {
    console.error("Error in /club_activity_list:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/feedback", async (req, res) => {
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

router.get("/getFunding/:fundingId", async (req, res) => {
  const { activityId: id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID query parameter is required",
    });
  }

  const authorized = await checkPermission(req, res, [{ executive: 4 }]);
  if (!authorized) {
    return;
  }

  try {
    // Fetch Funding data
    const funding = await Funding.findByPk(id, {
      include: [
        {
          model: FundingEvidence,
          as: "FundingEvidences",
          attributes: ["image_url", "description", "funding_evidence_type_id"],
        },
        {
          model: FundingFixture,
          as: "FundingFixtures",
        },
        {
          model: FundingTransportation,
          as: "FundingTransportations",
        },
        {
          model: FundingTransportationMember,
          as: "FundingTransportationMembers",
          attributes: ["student_id"],
          include: [
            {
              model: Member,
              as: "student",
              attributes: ["name"],
            },
          ],
        },
        {
          model: FundingNoncorp,
          as: "FundingNoncorps",
          attributes: [
            "trader_name",
            "trader_account_number",
            "waste_explanation",
          ],
        },
      ],
    });

    if (!funding) {
      return res.status(404).json({
        success: false,
        message: "Funding not found",
      });
    }
    // Format the response
    const responseData = {
      id: funding.id,
      name: funding.name,
      expenditureDate: funding.expenditure_date,
      expenditureAmount: funding.expenditure_amount,
      purpose: funding.purpose,
      isTransportation: funding.is_transportation,
      isNonCorporateTransaction: funding.is_non_corporate_transaction,
      transactionImages: funding.FundingEvidences
        ? funding.FundingEvidences.filter(
            (e) => e.funding_evidence_type_id === 1
          ).map((e) => ({
            imageUrl: e.image_url,
            fileName: e.description,
          }))
        : [],
      detailImages: funding.FundingEvidences
        ? funding.FundingEvidences.filter(
            (e) => e.funding_evidence_type_id === 2
          ).map((e) => ({
            imageUrl: e.image_url,
            fileName: e.description,
          }))
        : [],
      additionalProof: {
        isFoodExpense: funding.is_food_expense,
        isLaborContract: funding.is_labor_contract,
        isExternalEventParticipationFee:
          funding.is_external_event_participation_fee,
        isPublication: funding.is_publication,
        isProfitMakingActivity: funding.is_profit_making_activity,
        isJointExpense: funding.is_joint_expense,
        additionalText: funding.additional_explanation,
        additionalImages: funding.FundingEvidences
          ? funding.FundingEvidences.filter(
              (e) => e.funding_evidence_type_id === 3
            ).map((e) => ({
              imageUrl: e.image_url,
              fileName: e.description,
            }))
          : [],
      },
      fixture: {
        type: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].funding_fixture_type_id
          : 0,
        isSoftware: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].is_software
          : false,
        softwareProofText: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].software_proof_text
          : "",
        softwareProofImages: funding.FundingFixtures[0]
          ? funding.FundingEvidences.filter(
              (e) => e.funding_evidence_type_id === 5
            ).map((e) => ({
              imageUrl: e.image_url,
              fileName: e.description,
            }))
          : [],
        name: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].fixture_name
          : "",
        fixtureType: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].fixture_type_id
          : 0,
        purpose: funding.FundingFixtures[0]
          ? funding.FundingFixtures[0].usage_purpose
          : "",
        fixtureImages: funding.FundingEvidences
          ? funding.FundingEvidences.filter(
              (e) => e.funding_evidence_type_id === 4
            ).map((e) => ({
              imageUrl: e.image_url,
              fileName: e.description,
            }))
          : [],
      },
      transportation: {
        type: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].transportation_type_id
          : 0,
        origin: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].origin
          : "",
        destination: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].destination
          : "",
        purpose: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].purpose_of_use
          : "",
        cargoList: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].cargo_list
          : "",
        participants: funding.FundingTransportationMembers
          ? funding.FundingTransportationMembers.map((e) => ({
              student_id: e.student_id,
              name: e.student.name,
            }))
          : [],
        placeValidity: funding.FundingTransportations[0]
          ? funding.FundingTransportations[0].place_validity
          : "",
      },
      nonCorp: {
        traderName: funding.FundingNoncorps[0]
          ? funding.FundingNoncorps[0].trader_name
          : "",
        traderAccountNumber: funding.FundingNoncorps[0]
          ? funding.FundingNoncorps[0].trader_account_number
          : "",
        wasteExplanation: funding.FundingNoncorps[0]
          ? funding.FundingNoncorps[0].waste_explanation
          : "",
      },
    };

    res.json({
      success: true,
      funding: responseData,
    });
  } catch (error) {
    console.error("Error retrieving funding:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/my_feedback_funding", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

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
        const activityType = activity ? activity.activity_type_id : null;

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
        // const executiveMember = await Member.findByPk(studentId);

        return {
          activityId: activity ? activity.id : null,
          clubName,
          activityName,
          feedbackMemberName,
          activityType,
          feedbackType: feedbackTypeId,
        };
      })
    );

    responseArray.sort((a, b) => {
      if (a.clubName < b.clubName) {
        return -1;
      }
      if (a.clubName > b.clubName) {
        return 1;
      }
      return 0;
    });

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
  const { student_id, club_id, funding_id } = req.body;

  try {
    const authorized = await checkPermission(req, res, [{ executive: 3 }]);
    if (!authorized) {
      return;
    }

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

    if (funding_id) {
      // Update ActivityFeedbackExecutive for a specific activity
      await Funding.upsert({
        id: funding_id,
        funding_executive: student_id,
      });
      res.send("Executive updated successfully for the specific activity.");
    } else if (club_id) {
      // 현재 날짜를 포함하는 학기 찾기
      const currentSemester = await Semester.findOne({
        where: {
          start_date: { [Sequelize.Op.lte]: today },
          end_date: { [Sequelize.Op.gte]: today },
        },
      });

      // Fetch all activities within the activity duration range
      const filteredActivities = await Funding.findAll({
        where: {
          club_id: club_id,
          semester_id: currentSemester.id,
        },
      });

      // Update ActivityFeedbackExecutive for each activity
      for (const activity of filteredActivities) {
        await Funding.update(
          { funding_executive: student_id },
          { where: { id: activity.id } }
        );
      }

      res.send("Executive updated successfully for all activities.");
    } else {
      res.status(400).send("Invalid request parameters.");
    }
  } catch (error) {
    console.error("Error in /update_executive:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/funding_submit_list", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    const today = new Date();

    // 현재 날짜를 포함하는 학기 찾기
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Sequelize.Op.lte]: today },
        end_date: { [Sequelize.Op.gte]: today },
      },
    });

    // 전체 활동 개수 및 feedbackType이 1이 아닌 활동의 개수 조회
    // Fetch all activities within the activity duration range
    const filteredActivities = await Funding.findAll({
      where: {
        semester_id: currentSemester.id,
      },
    });

    // Compute total activities and non-feedback type one activities
    const totalActivities = filteredActivities.length;
    const nonFeedbackTypeOneActivities = filteredActivities.filter(
      (activity) => activity.funding_feedback_type !== 1
    ).length;

    // 비율 계산
    const ratio = (nonFeedbackTypeOneActivities / totalActivities) * 100;

    const findMostFrequentExecutive = async (clubId) => {
      const activities = await Funding.findAll({
        where: {
          club_id: clubId,
          semester_id: currentSemester.id,
        },
        attributes: ["id"],
      });
      const activityIds = activities.map((a) => a.id);

      const executives = await Funding.findAll({
        where: { id: activityIds },
        attributes: ["funding_executive"],
        group: ["funding_executive"],
        order: [
          [Sequelize.fn("COUNT", Sequelize.col("funding_executive")), "DESC"],
        ],
        limit: 1,
      });

      if (executives.length === 0)
        return { executive_id: null, executive: null };
      const mostFrequentStudentId = executives[0].funding_executive;

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
          acc[activity.funding_feedback_type] =
            (acc[activity.funding_feedback_type] || 0) + 1;
          return acc;
        }, {});

        const { executive_id, executive } = await findMostFrequentExecutive(
          sc.club_id
        );

        return {
          clubId: club.id,
          clubName: club.name,
          feedbackTypeOne: feedbackTypesCount[1] || 0,
          feedbackTypeTwo: feedbackTypesCount[2] || 0,
          feedbackTypeThree: feedbackTypesCount[3] || 0,
          feedbackTypeFour: feedbackTypesCount[4] || 0,
          totalClubActivities: clubActivities.length,
          totalExpenditureMoney: clubActivities.reduce(
            (total, activity) =>
              total + parseFloat(activity.expenditure_amount || 0),
            0
          ),
          totalApprovedMoney: clubActivities.reduce(
            (total, activity) =>
              total + parseFloat(activity.approved_amount || 0),
            0
          ),
          executive_id,
          executive,
        };
      })
    );

    clubData.sort((a, b) => b.feedbackTypeOne - a.feedbackTypeOne);
    const filteredClubData = clubData.filter(
      (data) => data.totalClubActivities > 0
    );

    res.json({
      totalActivities,
      nonFeedbackTypeOneActivities,
      ratio,
      clubData: filteredClubData,
    });
  } catch (error) {
    console.error("Error in /activity_submit_list:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/club_executive", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 3 }]);
    if (!authorized) {
      return;
    }

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

module.exports = router;
