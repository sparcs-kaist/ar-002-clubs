const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  sequelize,
  Sequelize,
  RegistrationMember,
  MemberStatus,
  Semester,
  Member,
  SemesterClub,
  SemesterClubType,
  MemberClub,
  Club,
} = require("../models");
const checkPermission = require("../utils/permission");
const { checkMemberDuration } = require("../utils/duration");

router.get("/clubs", async (req, res) => {
  try {
    // const durationCheck = await checkMemberDuration();
    // if (durationCheck.status === 0) {
    //   return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    // }

    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const now = new Date(utc + KR_TIME_DIFF);

    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    // Assuming you have a model relation like SemesterClub.belongsTo(Club) and RegistrationMember.belongsTo(SemesterClub)
    const clubsData = await SemesterClub.findAll({
      where: { semester_id: currentSemester.id },
      include: [
        {
          model: Club,
          as: "club",
          attributes: ["name"],
        },
        {
          model: RegistrationMember,
          as: "RegistrationMembers",
          attributes: ["approved_type"],
          include: [
            {
              model: Member,
              as: "student",
              include: [
                {
                  model: MemberStatus,
                  as: "MemberStatuses",
                  where: {
                    semester_id: currentSemester.id,
                    is_regular_member: 1,
                  },
                  required: false,
                },
              ],
            },
          ],
          required: false,
        },
        {
          model: SemesterClubType,
          as: "type",
          attributes: ["type"],
        },
      ],
    });

    console.log(clubsData[0].RegistrationMembers[0].student.MemberStatuses);
    const formattedData = clubsData
      .map((club) => {
        const clubInfo = club.toJSON();
        const totalMembers = clubInfo.RegistrationMembers.length;
        const totalApproved = clubInfo.RegistrationMembers.filter(
          (member) => member.approved_type === 2
        ).length;
        const totalApprovedRegular = clubInfo.RegistrationMembers.filter(
          (member) =>
            member.approved_type === 2 &&
            member.student.MemberStatuses.some(
              (status) => status.is_regular_member === true
            )
        ).length;

        return {
          club_id: clubInfo.club_id,
          name: clubInfo.club.name,
          type: clubInfo.type.type,
          count: totalMembers,
          countApproved: totalApproved,
          countApprovedRegular: totalApprovedRegular,
        };
      })
      .sort((a, b) => {
        // First sort by type
        if (a.type < b.type) return 1;
        if (a.type > b.type) return -1;

        // If types are the same, sort by countApprovedRegular
        return a.countApprovedRegular - b.countApprovedRegular;
      });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("Error fetching clubs:", error);
    res.status(500).json({ message: "Server error occurred." });
  }
});

router.post("/apply", async (req, res) => {
  //#MemberStatus db에 데이터 입력
  //semester_id는 currentSemester.id
  //student_id는 req.session.user.student_id
  //is_regular_member는 student_id의 뒷 네자리 (10000으로 나눈 나머지)가 1500보다 작으면 1, 아니면 2

  //#RegistrationMember db에 데이터 입력
  //semester_id는 currentSemester.id
  //student_id는 req.session.user.student_id
  //club_id는 쿼리로 부터 불러옴
  //approved_type은 1
  //apply_time은 now

  //transaction을 이용해 한번에 처리
  try {
    const durationCheck = await checkMemberDuration();
    if (durationCheck.status === 0) {
      return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    }

    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const now = new Date(utc + KR_TIME_DIFF);
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    const isRegularMember = req.session.user.student_id % 10000 < 1500 ? 1 : 2;
    const clubId = req.query.club_id; // Assuming club_id is passed as query parameter

    // Start a transaction
    const transaction = await sequelize.transaction();

    try {
      // Insert into MemberStatus (you would need to define or adjust this part based on your actual model)
      await MemberStatus.upsert(
        {
          semester_id: currentSemester.id,
          student_id: req.session.user.student_id,
          is_regular_member: isRegularMember,
        },
        { transaction }
      );

      // Insert into RegistrationMember
      await RegistrationMember.create(
        {
          semester_id: currentSemester.id,
          student_id: req.session.user.student_id,
          club_id: clubId,
          approved_type: 1, // assuming 1 means applied
          apply_time: now,
        },
        { transaction }
      );

      // Commit the transaction
      await transaction.commit();
      res.json({ success: true, message: "Application successful" });
    } catch (error) {
      // If an error occurs, rollback the transaction
      await transaction.rollback();
      throw error; // This will be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/cancel", async (req, res) => {
  //RegistrationMember db에서 데이터 찾기
  //semester_id는 currentSemester.id
  //student_id는 req.session.user.student_id
  //club_id는 쿼리로 부터 불러옴
  //위 세 조건을 만족하는 데이터를 찾기
  //만약 있으면 해당 데이터 삭제
  //없으면 "신청하지 않은 동아리 입니다" 에러 반환
  try {
    const durationCheck = await checkMemberDuration();
    if (durationCheck.status === 0) {
      return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    }

    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const now = new Date(utc + KR_TIME_DIFF);
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    const clubId = req.query.club_id; // Assuming club_id is passed as query parameter

    const registration = await RegistrationMember.findOne({
      where: {
        semester_id: currentSemester.id,
        student_id: req.session.user.student_id,
        club_id: clubId,
      },
    });

    if (registration) {
      await registration.destroy();
      res.json({ success: true, message: "Cancellation successful" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "신청하지 않은 동아리 입니다" });
    }
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/approve", async (req, res) => {
  //RegistrationMember db에서 데이터 찾기
  //semester_id는 currentSemester.id
  //student_id는 쿼리로 부터 불러옴
  //club_id는 쿼리로 부터 불러옴
  //approved_type은 1
  //위 네 조건을 만족하는 데이터를 찾기
  //만약 있으면 해당 데이터의 approved_type을 2로 변경
  //approve_time은 now로 변경
  //없으면 "신청하지 않은 회원 입니다" 에러 반환
  try {
    const durationCheck = await checkMemberDuration();
    if (durationCheck.status === 0) {
      return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    }

    // Assuming the club_id is provided as a query parameter and student_id is obtained from the session
    const clubId = req.query.club_id;
    const studentId = req.query.student_id; // Adjust based on how your session management is set up

    // console.log(clubId, studentId);
    // const authorized = await checkPermission(req, res, [
    //   { club_rep: 4, club_id: req.query.club_id },
    // ]);
    // if (!authorized) {
    //   return;
    // }

    const now = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    const registration = await RegistrationMember.findOne({
      where: {
        semester_id: currentSemester.id,
        student_id: studentId,
        club_id: clubId,
        // approved_type: 1,
      },
    });

    if (registration) {
      registration.approved_type = 2;
      registration.approve_time = now;
      await registration.save();

      await MemberClub.upsert({
        semester_id: currentSemester.id,
        student_id: studentId,
        club_id: clubId,
      });

      return res.json({
        success: true,
        message: "Member approved successfully",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "신청하지 않은 회원 입니다" });
    }
  } catch (error) {
    console.error("Error on approve:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.post("/disapprove", async (req, res) => {
  //RegistrationMember db에서 데이터 찾기
  //semester_id는 currentSemester.id
  //student_id는 쿼리로 부터 불러옴
  //club_id는 쿼리로 부터 불러옴
  //approved_type은 1
  //위 네 조건을 만족하는 데이터를 찾기
  //만약 있으면 해당 데이터의 approved_type을 3으로 변경
  //approve_time은 now로 변경
  //없으면 "신청하지 않은 회원 입니다" 에러 반환
  try {
    // Checking if the member modification period is still valid
    const durationCheck = await checkMemberDuration();
    if (durationCheck.status === 0) {
      return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    }

    // Assuming the club_id is provided as a query parameter and student_id is obtained from the session
    const clubId = req.query.club_id;
    const studentId = req.query.student_id;

    console.log(clubId, studentId);

    // const authorized = await checkPermission(req, res, [
    //   { club_rep: 4, club_id: req.query.club_id },
    //   // { executive: 3 },
    // ]);
    // if (!authorized) {
    //   return;
    // }

    // Calculating the current time in Korea Time Zone
    const now = new Date(
      new Date().getTime() +
        new Date().getTimezoneOffset() * 60000 +
        9 * 60 * 60 * 1000
    );

    // Finding the current semester based on the calculated current time
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    // Finding the registration entry to be disapproved
    const registration = await RegistrationMember.findOne({
      where: {
        semester_id: currentSemester.id,
        student_id: studentId,
        club_id: clubId,
        // approved_type: 1, // Only consider pending applications
      },
    });

    if (registration) {
      // Updating the entry to indicate disapproval
      registration.approved_type = 3; // 3 for disapproved
      registration.approve_time = now;
      await registration.save();

      await MemberClub.destroy({
        where: {
          semester_id: currentSemester.id,
          student_id: studentId,
          club_id: clubId,
        },
      });

      res.json({ success: true, message: "Member disapproved successfully" });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "신청하지 않은 회원 입니다" });
    }
  } catch (error) {
    console.error("Error in disapprove:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/list", async (req, res) => {
  //RegistrationMember db에서 데이터 찾기
  //semester_id는 currentSemester.id
  //club_id는 쿼리로 부터 불러옴
  //위 조건을 만족하는 데이터를 모두 찾기
  //student_id, approved_type, apply_time, approve_time의 배열 반환
  try {
    // Check if the member modification period is still valid
    // const durationCheck = await checkMemberDuration();
    // if (durationCheck.status === 0) {
    //   return res.status(400).send({ message: "활동 수정 기한이 지났습니다." });
    // }

    // Authorization check for users with club representative or executive permissions
    const clubId = req.query.club_id; // Assuming club_id is provided as a query parameter
    // const authorized = await checkPermission(req, res, [
    //   { club_rep: 4, club_id: clubId },
    //   { executive: 4 },
    // ]);
    // if (!authorized) {
    //   return res.status(403).send({ message: "권한이 없습니다." });
    // }

    // Calculate the current time in Korea Time Zone
    const now = new Date(
      new Date().getTime() +
        new Date().getTimezoneOffset() * 60000 +
        9 * 60 * 60 * 1000
    );

    // Find the current semester
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "Current semester not found" });
    }

    // Find all registration members for the given club_id and semester
    const registrations = await RegistrationMember.findAll({
      where: {
        semester_id: currentSemester.id,
        club_id: req.query.club_id,
      },
      include: [
        {
          model: Member,
          as: "student", // Make sure this alias matches the one defined in your association
          attributes: ["name", "email"],
        },
      ],
      attributes: [
        "student_id",
        "approved_type",
        [
          Sequelize.fn(
            "date_format",
            Sequelize.col("apply_time"),
            "%Y.%m.%d. %H:%i:%s"
          ),
          "apply_time_formatted",
        ],
        "approve_time",
      ],
    });

    // Map through registrations to include member details
    const formattedRegistrations = registrations.map((reg) => {
      return {
        ...reg.toJSON(),
        memberName: reg.student.name,
        memberEmail: reg.student.email,
        apply_time: reg.apply_time_formatted, // Use the formatted apply_time
      };
    });

    // Return the found registrations
    res.json({ success: true, data: formattedRegistrations });
  } catch (error) {
    console.error("Error in /list route:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

router.get("/duration", async (req, res) => {
  try {
    const durationCheck = await checkMemberDuration();

    if (!durationCheck.found) {
      return res.status(404).json({ message: durationCheck.message });
    }

    res.json({ status: durationCheck.status });
  } catch (error) {
    console.error("Error checking report duration:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

module.exports = router;
