const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Division,
  Club,
  SemesterClub,
  Semester,
  SemesterClubType,
  PermanentClub,
  ClubRepresentative,
  Member,
  MemberClub,
  MemberStatus,
  ClubBuilding,
  RegistrationMember,
} = require("../models");

router.get("/club_detail", async (req, res) => {
  const clubId = req.query.club_id;
  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }

  try {
    const currentDate = new Date();

    // Find the current semester
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "No current semester found" });
    }

    // Find the club by id, including the Division and ClubBuilding
    const club = await Club.findByPk(clubId, {
      include: [
        {
          model: Division,
          attributes: ["name"],
          as: "division",
        },
        {
          model: ClubBuilding,
          attributes: ["building_name"],
          as: "building",
        },
      ],
    });

    if (!club) {
      return res
        .status(404)
        .json({ success: false, message: "Club not found" });
    }

    // Get SemesterClub information
    const semesterClubInfo = await SemesterClub.findOne({
      where: {
        club_id: club.id,
        semester_id: currentSemester.id,
      },
      attributes: ["type_id", "characteristic_kr", "advisor"],
    });

    if (!semesterClubInfo) {
      return res.status(404).json({
        success: false,
        message: "Semester club information not found",
      });
    }

    // Find the type from the SemesterClubType model
    const semesterClubType = await SemesterClubType.findByPk(
      semesterClubInfo.type_id
    );

    // Determine clubType based on PermanentClub existence
    let clubType;
    const permanentClub = await PermanentClub.findOne({
      where: {
        club_id: club.id,
        start_date: { [Op.lte]: currentDate },
        [Op.or]: [{ end_date: { [Op.gte]: currentDate } }, { end_date: null }],
      },
    });
    clubType = permanentClub ? "상임동아리" : semesterClubType.type;

    // Get the club president
    let clubPresident = "";
    const clubRepresentative = await ClubRepresentative.findOne({
      where: {
        club_id: club.id,
        type_id: 1,
        start_term: { [Op.lte]: currentDate },
        [Op.or]: [{ end_term: { [Op.gte]: currentDate } }, { end_term: null }],
      },
    });
    if (clubRepresentative) {
      const presidentMember = await Member.findByPk(
        clubRepresentative.student_id
      );
      clubPresident = presidentMember ? presidentMember.name : "";
    }

    // Count total members
    const totalMembersCount = await MemberClub.count({
      where: {
        club_id: club.id,
        semester_id: currentSemester.id,
      },
    });

    // Construct room location string
    const roomLocation =
      club.building && club.room_location
        ? `${club.building.building_name} ${club.room_location}`
        : "없음";

    res.json({
      success: true,
      data: {
        id: club.id,
        clubName: club.name,
        divisionName: club.division.name ? club.division.name : "",
        clubType: clubType,
        characteristicKr: semesterClubInfo.characteristic_kr,
        advisor: semesterClubInfo.advisor,
        totalMembers: totalMembersCount,
        clubPresident: clubPresident,
        description: club.description,
        foundingYear: club.founding_year,
        room: roomLocation,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.post("/updateDescription", async (req, res) => {
  const { clubId, description } = req.body;

  try {
    // Find the club by ID
    const club = await Club.findByPk(clubId);

    // Check if club exists
    if (!club) {
      return res.status(404).send({ message: "Club not found" });
    }

    // Update the club description
    await club.update({ description });

    res.status(200).send({ message: "Club description updated successfully" });
  } catch (error) {
    console.error("Error updating club description:", error);
    res.status(500).send({ message: "Error updating club description" });
  }
});

router.get("/club_members/:clubId", async (req, res) => {
  const { clubId } = req.params;
  const today = new Date();

  try {
    // Find the current semester
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
    });

    if (!currentSemester) {
      return res.status(404).send({ message: "Current semester not found" });
    }

    // Fetch club representatives for the current semester
    const representatives = await ClubRepresentative.findAll({
      where: {
        start_term: { [Op.lte]: today },
        [Op.or]: [{ end_term: { [Op.gte]: today } }, { end_term: null }],
      },
    });

    const repStudentIds = representatives.map((rep) => rep.student_id);

    // Fetch club members excluding representatives
    const members = await MemberClub.findAll({
      where: {
        club_id: clubId,
        semester_id: currentSemester.id,
        student_id: { [Op.notIn]: repStudentIds },
      },
      include: [
        {
          model: Member,
          as: "student",
          attributes: ["student_id", "name"],
        },
      ],
    });

    // Prepare the response
    const memberDetails = members.map((member) => ({
      student_id: member.student.student_id,
      name: member.student.name,
    }));

    res.json(memberDetails);
  } catch (error) {
    console.error("Error fetching club members:", error);
    res.status(500).send({ message: "Error fetching club members" });
  }
});

router.post("/update_representatives", async (req, res) => {
  const { prev_student_id, next_student_id, rep_id, club_id } = req.body; // POST 요청이므로 req.body를 사용합니다

  try {
    // 현재 날짜와 어제 날짜 계산
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 기존 대표자의 end_term 업데이트
    await ClubRepresentative.update(
      { end_term: yesterday },
      {
        where: {
          club_id: club_id,
          student_id: prev_student_id,
          type_id: rep_id,
        },
      }
    );

    // 새 대표자 확인 및 추가
    const [newRep, created] = await ClubRepresentative.findOrCreate({
      where: {
        club_id: club_id,
        student_id: next_student_id,
        type_id: rep_id,
      },
      defaults: {
        start_term: today,
        end_term: null,
      },
    });

    if (!created) {
      // 이미 존재하는 경우, end_term만 업데이트
      await newRep.update({ end_term: null });
    }

    res.send({ message: "Representatives updated successfully" });
  } catch (error) {
    console.error("Error updating representatives:", error);
    res.status(500).send({ message: "Error updating representatives" });
  }
});

router.get("/club_manage", async (req, res) => {
  const { club_id: clubId } = req.query;

  // const clubRep = await ClubRepresentative.findOne({
  //   where: {
  //     student_id,
  //     start_term: {
  //       [Op.lte]: currentDate,
  //     },
  //     [Op.or]: [{ end_term: null }, { end_term: { [Op.gte]: currentDate } }],
  //   },
  // });
  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "club_id query parameter is required",
    });
  }
  console.log(clubId);

  try {
    const club = await Club.findByPk(clubId, {
      attributes: ["id", "name", "description"],
    });
    if (!club) {
      return res.status(404).json({
        success: false,
        message: "Club not found",
      });
    }

    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });
    // Find additional info about the club including advisor
    const semesterClubInfo = await SemesterClub.findOne({
      where: {
        club_id: club.id,
        semester_id: currentSemester.id,
      },
      attributes: ["advisor"],
    });

    // Retrieve club representatives
    const representatives = await Promise.all(
      [1, 2, 3].map(async (typeId) => {
        const rep = await ClubRepresentative.findOne({
          where: {
            club_id: clubId,
            type_id: typeId,
            start_term: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_term: { [Op.gte]: currentDate } },
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
        return rep
          ? { student_id: rep.student.student_id, name: rep.student.name }
          : { student_id: 0, name: "" };
      })
    );

    res.json({
      success: true,
      data: {
        clubId: club.id,
        clubName: club.name,
        description: club.description,
        representatives: representatives,
        advisor: semesterClubInfo ? semesterClubInfo.advisor : "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

router.get("/division_list", async (req, res) => {
  try {
    const divisions = await Division.findAll({
      attributes: ["id", "name"], // id와 name 속성만 선택
      where: {
        id: {
          [Op.notIn]: [13, 14], // '회장'과 '부회장'이 아닌 이름만 선택
        },
      },
    });
    console.log(divisions);
    res.json({
      success: true,
      data: divisions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/division_clubs", async (req, res) => {
  const divisionId = req.query.division_id;
  if (!divisionId) {
    return res.status(400).json({
      success: false,
      message: "division_id query parameter is required",
    });
  }

  try {
    // Get the current semester
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    // Get the clubs for the given division
    const clubs = await Club.findAll({
      where: {
        division_id: divisionId,
      },
      include: [
        {
          model: SemesterClub,
          as: "SemesterClubs",
          required: true,
          where: {
            semester_id: currentSemester.id,
          },
        },
      ],
      attributes: ["id", "name"],
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "No current semester found" });
    }

    // Get the SemesterClub information for each club in the current semester
    const clubInfos = await Promise.all(
      clubs.map(async (club) => {
        const semesterClubInfo = await SemesterClub.findOne({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
          },
          attributes: ["type_id", "characteristic_kr", "advisor"],
        });

        // Get the type from the SemesterClubType model
        const semesterClubType = await SemesterClubType.findByPk(
          semesterClubInfo.type_id
        );

        let clubType;
        let clubPresident = "";

        //PermanentClub에 club_id가 존재하고, 그 start-date가 현재보다 이전이며, end_date가 없거나, 현재보다 이후일 경우 clubType = "상임동아리", 그렇치 않을경우 clubType =  semesterClubType.type으로 설정
        const permanentClub = await PermanentClub.findOne({
          where: {
            club_id: club.id,
            start_date: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_date: { [Op.gte]: currentDate } },
              { end_date: null },
            ],
          },
        });
        if (permanentClub) {
          clubType = "상임동아리";
        } else {
          clubType = semesterClubType.type;
        }

        //ClubRepresentative에 club_id가 존재하고, type_id가 1이며, 그 start-date가 현재보다 이전이며, end_date가 없거나, 현재보다 이후일 경우 student_id를 반환
        //만약 student_id 가 존재한다면, Member에 그 student_id의 name을 clubPresident로 반환. 없으면 "" 반환
        const clubRepresentative = await ClubRepresentative.findOne({
          where: {
            club_id: club.id,
            type_id: 1,
            start_term: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_term: { [Op.gte]: currentDate } },
              { end_term: null },
            ],
          },
        });
        if (clubRepresentative) {
          const presidentMember = await Member.findByPk(
            clubRepresentative.student_id
          );
          clubPresident = presidentMember ? presidentMember.name : "";
        }
        //MemberClub에서 currentSemester에 대해서 해당 club_id를 갖고 있는 student가 모두 몇명인지 count해서 totalMembers로 반환, 없거나 문제 생기면 0 반환
        const totalMembersCount = await MemberClub.count({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
          },
        });

        const registrationState = await RegistrationMember.findOne({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
            student_id: req.session.user.student_id,
          },
        });

        return {
          id: club.id,
          clubName: club.name,
          characteristicKr: semesterClubInfo.characteristic_kr,
          clubType: clubType, // Use the type value from the SemesterClubType model
          clubPresident: clubPresident,
          advisor: semesterClubInfo.advisor,
          totalMembers: totalMembersCount,
          registrationState: registrationState
            ? registrationState.approved_type
            : 0,
        };
      })
    );

    res.json({
      success: true,
      data: clubInfos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/my_semester", async (req, res) => {
  if (!req.session.user || !req.session.user.student_id) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - Please login first" });
  }
  console.log(req.session);
  const { student_id } = req.session.user;

  try {
    const memberStatuses = await MemberStatus.findAll({
      where: { student_id },
      include: {
        as: "semester",
        model: Semester,
        attributes: ["year", "semester"],
      },
      order: [[{ model: Semester, as: "semester" }, "id", "DESC"]],
    });

    if (!memberStatuses || memberStatuses.length === 0) {
      return res
        .status(404)
        .json({ error: "No records found for the provided student_id" });
    }

    const result = memberStatuses.map((status) => ({
      semester_id: status.semester_id,
      year_semester: `${status.semester.year} ${status.semester.semester}`,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//특정 유저의 특정 학기에 대한 동아리 목록 가져오기
router.get("/my_semester_clubs", async (req, res) => {
  if (!req.session.user || !req.session.user.student_id) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - Please login first" });
  }
  let { semester_id } = req.query; // 쿼리 파라미터에서 semester_id와 student_id를 추출합니다.
  console.log(req.session.user);
  const { student_id } = req.session.user;

  // semester_id와 student_id가 모두 제공되었는지 확인합니다.
  if (!student_id) {
    return res.status(400).json({
      success: false,
      message: "student_id query parameter is required",
    });
  }

  try {
    // Get the current semester
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (!currentSemester) {
      return res
        .status(400)
        .json({ success: false, message: "CurrentSemeter does not exist" });
    }

    if (!semester_id) {
      semester_id = currentSemester.id;
      console.log(semester_id);
    }

    // Get the clubs that the student is a member of for the given semester
    const memberClubs = await MemberClub.findAll({
      where: {
        student_id: student_id,
        semester_id: semester_id,
      },
      attributes: ["club_id"],
      raw: true, // raw 데이터만 필요합니다.
    });

    // Map the array of memberClubs to get an array of club_ids
    const clubIds = memberClubs.map((mc) => mc.club_id);

    // Get the club details for the club_ids
    const clubs = await Club.findAll({
      where: {
        id: { [Op.in]: clubIds },
      },
      attributes: ["id", "name"],
      raw: true,
    });

    if (!currentSemester) {
      return res
        .status(404)
        .json({ success: false, message: "No current semester found" });
    }

    // Get the SemesterClub information for each club in the current semester
    const clubInfos = await Promise.all(
      clubs.map(async (club) => {
        const semesterClubInfo = await SemesterClub.findOne({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
          },
          attributes: ["type_id", "characteristic_kr", "advisor"],
        });

        // Get the type from the SemesterClubType model
        const semesterClubType = await SemesterClubType.findByPk(
          semesterClubInfo.type_id
        );

        let clubType;
        let clubPresident = "";

        //PermanentClub에 club_id가 존재하고, 그 start-date가 현재보다 이전이며, end_date가 없거나, 현재보다 이후일 경우 clubType = "상임동아리", 그렇치 않을경우 clubType =  semesterClubType.type으로 설정
        const permanentClub = await PermanentClub.findOne({
          where: {
            club_id: club.id,
            start_date: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_date: { [Op.gte]: currentDate } },
              { end_date: null },
            ],
          },
        });
        if (permanentClub) {
          clubType = "상임동아리";
        } else {
          clubType = semesterClubType.type;
        }

        //ClubRepresentative에 club_id가 존재하고, type_id가 1이며, 그 start-date가 현재보다 이전이며, end_date가 없거나, 현재보다 이후일 경우 student_id를 반환
        //만약 student_id 가 존재한다면, Member에 그 student_id의 name을 clubPresident로 반환. 없으면 "" 반환
        const clubRepresentative = await ClubRepresentative.findOne({
          where: {
            club_id: club.id,
            type_id: 1,
            start_term: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_term: { [Op.gte]: currentDate } },
              { end_term: null },
            ],
          },
        });
        if (clubRepresentative) {
          const presidentMember = await Member.findByPk(
            clubRepresentative.student_id
          );
          clubPresident = presidentMember ? presidentMember.name : "";
        }
        //MemberClub에서 currentSemester에 대해서 해당 club_id를 갖고 있는 student가 모두 몇명인지 count해서 totalMembers로 반환, 없거나 문제 생기면 0 반환
        const totalMembersCount = await MemberClub.count({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
          },
        });

        return {
          id: club.id,
          clubName: club.name,
          characteristicKr: semesterClubInfo.characteristic_kr,
          clubType: clubType, // Use the type value from the SemesterClubType model
          clubPresident: clubPresident,
          advisor: semesterClubInfo.advisor,
          totalMembers: totalMembersCount,
        };
      })
    );

    res.json({
      success: true,
      data: clubInfos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
