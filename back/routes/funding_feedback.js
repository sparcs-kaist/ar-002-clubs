const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Sequelize,
  Semester,
  Club,
  Funding,
  FundingFeedback,
  FundingEvidence,
  FundingFixture,
  FundingTransportation,
  FundingTransportationMember,
  FundingNoncorp,
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

    // Fetch filtered activities
    const filteredFundings = await Funding.findAll({
      where: {
        club_id: club_id,
        semester_id: currentSemester.id,
      },
      include: [
        {
          model: FundingFeedback,
          as: "FundingFeedbacks", // Alias defined in your associations
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
          model: Member,
          as: "funding_executive_Member", // Alias for Member association in ExecutiveMember
          attributes: ["student_id", "name"],
        },
      ],
      order: [["funding_feedback_type", "ASC"]],
      attributes: [
        "id",
        "name",
        "recent_edit",
        "recent_feedback",
        "funding_feedback_type",
        "expenditure_amount",
        "approved_amount",
      ],
    });

    // Process and return the response
    const responseArray = filteredFundings.map((funding) => {
      const recentFeedback = funding.FundingFeedbacks[0];
      const executiveFeedback = funding.funding_executive_Member;

      return {
        name: funding.name,
        fundingId: funding.id,
        recent_edit: formatSignTime(funding.recent_edit),
        recent_feedback: formatSignTime(funding.recent_feedback),
        feedbackMemberName: recentFeedback ? recentFeedback.student.name : null,
        executive_id: executiveFeedback ? executiveFeedback.student_id : null,
        executiveName: executiveFeedback ? executiveFeedback.name : null,
        feedbackType: funding.funding_feedback_type,
        expenditureAmount: funding.expenditure_amount,
        approvedAmount: funding.approved_amount,
      };
    });

    // Fetch the club name
    const club = await Club.findByPk(club_id);
    if (!club) {
      return res.status(404).send("Club not found.");
    }
    const clubName = club.name;

    const totalExpenditureAmount = filteredFundings.reduce((total, funding) => {
      return total + (funding.expenditure_amount || 0);
    }, 0);

    const totalApprovedAmount = filteredFundings.reduce((total, funding) => {
      return total + (funding.approved_amount || 0);
    }, 0);

    res.json({
      clubName,
      fundings: responseArray,
      totalExpenditureAmount,
      totalApprovedAmount,
    });
  } catch (error) {
    console.error("Error in /club_funding_list:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
    if (!authorized) {
      return;
    }

    const { funding_id, reviewResult, funding } = req.body;
    const studentId = req.session.user.student_id;
    const currentTimePlusNineHours = new Date(
      new Date().getTime() + 9 * 60 * 60 * 1000
    );

    console.log(funding.approvedAmount);

    // Update feedback_type in Activity based on reviewResult
    let feedbackType = 4;
    if (funding.approvedAmount === 0) {
      feedbackType = 4;
    } else if (
      0 < funding.approvedAmount &&
      funding.approvedAmount < funding.expenditureAmount
    ) {
      feedbackType = 3;
    } else if (funding.approvedAmount === funding.expenditureAmount) {
      feedbackType = 2;
    }

    await Funding.update(
      {
        funding_feedback_type: feedbackType,
        recent_feedback: currentTimePlusNineHours,
        is_committee: funding.isCommittee,
        approved_amount: funding.approvedAmount,
      },
      { where: { id: funding_id } }
    );

    // Save a new record in ActivityFeedback
    await FundingFeedback.create({
      funding: funding_id,
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
  const { fundingId: id } = req.params;

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

    const feedbacks = await FundingFeedback.findAll({
      where: { funding: id },
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
          feedback_time: formatSignTime(feedback.added_time),
          text: feedback.feedback,
          // reviewerName: feedback.student.name, // assuming you want to include the name of the reviewer
        };
      });

    // Format the response
    const responseData = {
      id: funding.id,
      name: funding.name,
      clubId: funding.club_id,
      expenditureDate: funding.expenditure_date,
      expenditureAmount: funding.expenditure_amount,
      approvedAmount: funding.approved_amount,
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
      isCommittee: funding.is_committee ? funding.is_committee : false,
      feedbackResults,
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
    const feedbackExecutives = await Funding.findAll({
      where: { funding_executive: studentId },
      include: [
        {
          model: Club,
          as: "club", // Assuming 'Club' is the alias used in the Activity-Club association
          attributes: ["name"],
        },
      ],
    });

    const responseArray = await Promise.all(
      feedbackExecutives.map(async (feedbackExecutive) => {
        const activity = feedbackExecutive;

        // Check if activity and club are defined
        const clubName =
          activity && activity.club ? activity.club.name : "Unknown Club";
        const activityName = activity ? activity.name : "Unknown Funding";
        const feedbackTypeId = activity ? activity.funding_feedback_type : null;
        const expenditureAmount = activity ? activity.expenditure_amount : null;
        const approvedAmount = activity ? activity.approved_amount : null;

        // Fetch feedback details
        const feedbackDetail = await FundingFeedback.findOne({
          where: { funding: activity ? activity.id : null },
          order: [["added_time", "DESC"]],
          include: [
            {
              model: Member,
              attributes: ["name"],
              as: "student",
            },
          ],
        });
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
          expenditureAmount,
          approvedAmount,
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
    const authorized = await checkPermission(req, res, [{ executive: 4 }]);
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
