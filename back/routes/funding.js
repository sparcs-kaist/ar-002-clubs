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
const { checkFundingDuration } = require("../utils/duration");

router.get("/funding_list", async (req, res) => {
  const clubId = req.query.club_id;
  const currentDate = new Date();

  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }

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
    // Find fundings for the club within the semester
    const fundings = await Funding.findAll({
      where: {
        club_id: clubId,
        // semester_id: currentSemester.id,
      },
      attributes: [
        "id",
        "name",
        "expenditure_date",
        "expenditure_amount",
        "approved_amount",
        "purpose",
        "funding_feedback_type",
        "recent_edit",
        // Add other required fields
      ],
      order: [
        ["recent_edit", "DESC"],
        // ["purpose", "ASC"],
        // ["expenditure_date", "ASC"],
      ],
    });

    // Calculate total expenditure and approved amounts
    const totalExpenditure = fundings.reduce(
      (acc, funding) => acc + Number(funding.expenditure_amount),
      0
    );
    const totalApproved = fundings.reduce(
      (acc, funding) => acc + Number(funding.approved_amount),
      0
    );

    // Map funding to include activityName
    const fundingWithActivityNames = await Promise.all(
      fundings.map(async (funding) => {
        let activityName = "비품 및 활동보고서로 증빙이 불가한 물품";
        if (funding.purpose > 0) {
          // Fetch the activity with the given ID
          const activity = await Activity.findByPk(funding.purpose);
          activityName = activity ? activity.title : "Unknown Activity";
        }

        return {
          id: funding.id,
          name: funding.name,
          expenditureDate: funding.expenditure_date,
          expenditureAmount: funding.expenditure_amount,
          approvedAmount: funding.approved_amount,
          feedbackType: funding.funding_feedback_type,
          activityName: activityName,
          recentEdit: funding.recent_edit,
          // Map other required fields
        };
      })
    );

    res.json({
      success: true,
      funding: fundingWithActivityNames,
      totalExpenditureAmount: totalExpenditure,
      totalApprovedAmount: totalApproved,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.post("/deleteFunding/:fundingId", async (req, res) => {
  const durationCheck = await checkFundingDuration();
  if (!durationCheck.found || durationCheck.reportStatus !== 1) {
    return res.status(400).send({ message: "활동 삭제 기한이 지났습니다." });
  }

  const { fundingId } = req.params;

  const transaction = await sequelize.transaction();
  try {
    // Update Funding
    const funding = await Funding.findByPk(fundingId, { transaction });
    if (!funding) {
      return res
        .status(404)
        .json({ success: false, message: "Funding not found" });
    }

    const authorized = await checkPermission(req, res, [
      { club_rep: 4, club_id: funding.club_id },
    ]);
    if (!authorized) {
      return;
    }

    // Delete existing related data and insert new data
    // For FundingEvidence
    await FundingEvidence.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingFixture
    await FundingFixture.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingTransportation
    await FundingTransportation.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingTransportation
    await FundingTransportationMember.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingNoncorp
    await FundingNoncorp.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    await Funding.destroy({ where: { id: fundingId } }, { transaction });

    // Commit the transaction
    await transaction.commit();
    console.log("성공");

    res
      .status(200)
      .send({ message: "Funding and related data deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Error funding activity:", error);
    res.status(500).send("Error deleting funding");
  }
});

router.post("/editFunding", async (req, res) => {
  // Extract data from request body
  const {
    fundingId,
    clubId,
    name,
    expenditureDate,
    expenditureAmount,
    purpose,
    isTransportation,
    isNonCorporateTransaction,
    transactionImages,
    detailImages,
    additionalProof,
    fixture,
    transportation,
    nonCorp,
  } = req.body;

  const authorized = await checkPermission(req, res, [
    { club_rep: 4, club_id: clubId },
  ]);
  if (!authorized) {
    return;
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

  try {
    // Update Funding
    const funding = await Funding.findByPk(fundingId, { transaction });
    if (!funding) {
      return res
        .status(404)
        .json({ success: false, message: "Funding not found" });
    }

    await funding.update(
      {
        name,
        club_id: clubId,
        semester_id: currentSemester.id,
        expenditure_date: expenditureDate,
        expenditure_amount: expenditureAmount,
        approved_amount: 0,
        purpose,
        is_transportation: isTransportation,
        is_non_corporate_transaction: isNonCorporateTransaction,
        is_food_expense: additionalProof.isFoodExpense,
        is_labor_contract: additionalProof.isLaborContract,
        is_external_event_participation_fee:
          additionalProof.isExternalEventParticipationFee,
        is_publication: additionalProof.isPublication,
        is_profit_making_activity: additionalProof.isProfitMakingActivity,
        is_joint_expense: additionalProof.isJointExpense,
        additional_explanation: additionalProof.additionalText,
        funding_feedback_type: 1,
        recent_edit: currentDateTimeUTC,
      },
      { transaction }
    );

    // Delete existing related data and insert new data
    // For FundingEvidence
    await FundingEvidence.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingFixture
    await FundingFixture.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingTransportation
    await FundingTransportation.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingTransportation
    await FundingTransportationMember.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // For FundingNoncorp
    await FundingNoncorp.destroy(
      { where: { funding_id: fundingId } },
      { transaction }
    );

    // Insert FundingEvidence for transaction images
    await FundingEvidence.bulkCreate(
      transactionImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 1,
      })),
      { transaction }
    );

    // Insert FundingEvidence for detail images
    await FundingEvidence.bulkCreate(
      detailImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 2,
      })),
      { transaction }
    );

    await FundingEvidence.bulkCreate(
      additionalProof.additionalImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 3,
      })),
      { transaction }
    );

    // Insert Fixture data if available
    if (purpose == 0 && fixture) {
      const fundingFixture = await FundingFixture.create(
        {
          funding_id: funding.id,
          funding_fixture_type_id: fixture.type > 0 ? fixture.type : null,
          fixture_name: fixture.name,
          fixture_type_id: fixture.fixtureType > 0 ? fixture.fixtureType : null,
          usage_purpose: fixture.purpose,
          is_software: fixture.isSoftware,
          software_proof_text: fixture.softwareProofText,
        },
        { transaction }
      );

      // Insert FundingFixtureEvidence
      await FundingEvidence.bulkCreate(
        fixture.fixtureImages.map((image) => ({
          funding_id: funding.id,
          image_url: image.imageUrl,
          description: image.fileName,
          funding_evidence_type_id: 4,
        })),
        { transaction }
      );

      // Insert FundingFixtureEvidence
      await FundingEvidence.bulkCreate(
        fixture.softwareProofImages.map((image) => ({
          funding_id: funding.id,
          image_url: image.imageUrl,
          description: image.fileName,
          funding_evidence_type_id: 5,
        })),
        { transaction }
      );
    }

    // Insert Transportation data if available
    if (isTransportation && transportation) {
      const fundingTransportation = await FundingTransportation.create(
        {
          funding_id: funding.id,
          transportation_type_id: transportation.type,
          origin: transportation.origin,
          destination: transportation.destination,
          purpose_of_use: transportation.purpose,
          cargo_list: transportation.cargoList,
          place_validity: transportation.placeValidity,
        },
        { transaction }
      );

      // Insert FundingTransportationMember
      await FundingTransportationMember.bulkCreate(
        transportation.participants.map((participant) => ({
          funding_id: funding.id,
          student_id: participant.student_id,
        })),
        { transaction }
      );
    }
    // Insert Non-corporate transaction data if available
    if (isNonCorporateTransaction && nonCorp) {
      await FundingNoncorp.create(
        {
          funding_id: funding.id,
          trader_name: nonCorp.traderName,
          trader_account_number: nonCorp.traderAccountNumber,
          waste_explanation: nonCorp.wasteExplanation,
          // Other necessary fields...
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.json({ success: true, message: "Funding added successfully" });
  } catch (error) {
    console.error("Error adding funding:", error);

    // Rollback transaction in case of error
    await transaction.rollback();

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getFunding", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID query parameter is required",
    });
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

    const authorized = await checkPermission(req, res, [
      { club_rep: 4, club_id: funding.club_id },
      // { executive: 4 },
    ]);
    if (!authorized) {
      return;
    }

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
    const feedbackResults = feedbacks.map((feedback) => {
      return {
        addedTime: feedback.added_time,
        text: feedback.feedback,
        reviewerName: feedback.student.name, // assuming you want to include the name of the reviewer
      };
    });

    // Format the response
    const responseData = {
      id: funding.id,
      name: funding.name,
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

router.post("/addFunding", async (req, res) => {
  // Extract data from request body
  const {
    clubId,
    name,
    expenditureDate,
    expenditureAmount,
    purpose,
    isTransportation,
    isNonCorporateTransaction,
    transactionImages,
    detailImages,
    additionalProof,
    fixture,
    transportation,
    nonCorp,
  } = req.body;

  const authorized = await checkPermission(req, res, [
    { club_rep: 4, club_id: clubId },
  ]);
  if (!authorized) {
    return;
  }

  const durationCheck = await checkFundingDuration();
  if (!durationCheck.found || durationCheck.reportStatus !== 1) {
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
  try {
    // Create Funding
    const funding = await Funding.create(
      {
        name,
        club_id: clubId,
        semester_id: currentSemester.id,
        expenditure_date: expenditureDate,
        expenditure_amount: expenditureAmount,
        approved_amount: 0,
        purpose,
        is_transportation: isTransportation,
        is_non_corporate_transaction: isNonCorporateTransaction,
        is_food_expense: additionalProof.isFoodExpense,
        is_labor_contract: additionalProof.isLaborContract,
        is_external_event_participation_fee:
          additionalProof.isExternalEventParticipationFee,
        is_publication: additionalProof.isPublication,
        is_profit_making_activity: additionalProof.isProfitMakingActivity,
        is_joint_expense: additionalProof.isJointExpense,
        additional_explanation: additionalProof.additionalText,
        funding_feedback_type: 1,
        recent_edit: currentDateTimeUTC,
      },
      { transaction }
    );

    // Insert FundingEvidence for transaction images
    await FundingEvidence.bulkCreate(
      transactionImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 1,
        // You might need to set funding_evidence_type_id based on your business logic
      })),
      { transaction }
    );

    // Insert FundingEvidence for detail images
    await FundingEvidence.bulkCreate(
      detailImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 2,
      })),
      { transaction }
    );

    await FundingEvidence.bulkCreate(
      additionalProof.additionalImages.map((image) => ({
        funding_id: funding.id,
        image_url: image.imageUrl,
        description: image.fileName,
        funding_evidence_type_id: 3,
      })),
      { transaction }
    );

    // Insert Fixture data if available
    if (purpose == 0 && fixture) {
      const fundingFixture = await FundingFixture.create(
        {
          funding_id: funding.id,
          funding_fixture_type_id: fixture.type > 0 ? fixture.type : null,
          fixture_name: fixture.name,
          fixture_type_id: fixture.fixtureType > 0 ? fixture.fixtureType : null,
          usage_purpose: fixture.purpose,
          is_software: fixture.isSoftware,
          software_proof_text: fixture.softwareProofText,
        },
        { transaction }
      );

      // Insert FundingFixtureEvidence
      await FundingEvidence.bulkCreate(
        fixture.fixtureImages.map((image) => ({
          funding_id: funding.id,
          image_url: image.imageUrl,
          description: image.fileName,
          funding_evidence_type_id: 4,
        })),
        { transaction }
      );

      // Insert FundingFixtureEvidence
      await FundingEvidence.bulkCreate(
        fixture.softwareProofImages.map((image) => ({
          funding_id: funding.id,
          image_url: image.imageUrl,
          description: image.fileName,
          funding_evidence_type_id: 5,
        })),
        { transaction }
      );
    }

    // Insert Transportation data if available
    if (isTransportation && transportation) {
      const fundingTransportation = await FundingTransportation.create(
        {
          funding_id: funding.id,
          transportation_type_id: transportation.type,
          origin: transportation.origin,
          destination: transportation.destination,
          purpose_of_use: transportation.purpose,
          cargo_list: transportation.cargoList,
          place_validity: transportation.placeValidity,
        },
        { transaction }
      );

      // Insert FundingTransportationMember
      await FundingTransportationMember.bulkCreate(
        transportation.participants.map((participant) => ({
          funding_id: funding.id,
          student_id: participant.student_id,
        })),
        { transaction }
      );
    }
    // Insert Non-corporate transaction data if available
    if (isNonCorporateTransaction && nonCorp) {
      await FundingNoncorp.create(
        {
          funding_id: funding.id,
          trader_name: nonCorp.traderName,
          trader_account_number: nonCorp.traderAccountNumber,
          waste_explanation: nonCorp.wasteExplanation,
          // Other necessary fields...
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.json({ success: true, message: "Funding added successfully" });
  } catch (error) {
    console.error("Error adding funding:", error);

    // Rollback transaction in case of error
    await transaction.rollback();

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/search_members", async (req, res) => {
  const { activity_id: activity_id, query } = req.query;

  if (!activity_id) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }

  try {
    // 해당 동아리에 속한 회원들 조회
    const members = await ActivityMember.findAll({
      where: {
        activity_id,
      },
      attributes: ["member_student_id"],
    });

    const memberNames = await Promise.all(
      members.map(async (memberClub) => {
        const member = await Member.findOne({
          where: { student_id: memberClub.member_student_id },
          attributes: ["name"],
        });
        return {
          student_id: memberClub.member_student_id,
          name: member.name,
        };
      })
    );

    const seenIds = new Set();
    const filteredMembers = memberNames.filter((member) => {
      const duplicate = seenIds.has(member.student_id);
      seenIds.add(member.student_id);
      return (
        !duplicate && member.name.toLowerCase().includes(query.toLowerCase())
      );
    });

    res.json({
      success: true,
      members: filteredMembers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/is_funding_duration", async (req, res) => {
  try {
    const durationCheck = await checkFundingDuration();

    if (!durationCheck.found) {
      return res.status(404).json({ message: durationCheck.message });
    }

    res.json({ fundingStatus: durationCheck.fundingStatus });
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
