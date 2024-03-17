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
} = require("../../models");

async function getClubRepresentative(clubId, currentDate) {
  const clubRepresentative = await ClubRepresentative.findOne({
    where: {
      club_id: clubId,
      type_id: 1,
      start_term: { [Op.lte]: currentDate },
      [Op.or]: [{ end_term: { [Op.gte]: currentDate } }, { end_term: null }],
    },
  });
  if (clubRepresentative) {
    const presidentMember = await Member.findByPk(
      clubRepresentative.student_id
    );
    return presidentMember ? presidentMember.name : "";
  }
  return "";
}

router.get("/", async (req, res) => {
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
        .status(404)
        .json({ success: false, message: "No current semester found" });
    }

    // Fetch all divisions except the ones with ids 13 and 14
    const divisions = await Division.findAll({
      attributes: ["id", "name"],
      where: {
        id: { [Op.notIn]: [13, 14] },
      },
      include: [
        {
          model: Club,
          as: "Clubs",
          attributes: ["id", "name"],
          include: [
            {
              model: SemesterClub,
              as: "SemesterClubs",
              attributes: ["type_id", "characteristic_kr", "advisor"],
              required: true,
              where: {
                semester_id: currentSemester.id,
              },
              include: [
                {
                  model: SemesterClubType,
                  as: "type",
                  attributes: ["type"], // Assuming 'type' is a field in SemesterClubType
                },
              ],
            },
          ],
        },
      ],
    });

    const divisionClubsData = await Promise.all(
      divisions.map(async (division) => {
        const clubsData = await Promise.all(
          division.Clubs.map(async (club) => {
            // Get representative, type, and member count details
            const clubType = club.SemesterClubs[0].type.type;
            const representative = await getClubRepresentative(
              club.id,
              currentDate
            );
            const totalMembers = await MemberClub.count({
              where: {
                club_id: club.id,
                semester_id: currentSemester.id,
              },
            });

            return {
              id: club.id,
              name: club.name,
              type: clubType,
              characteristic: club.SemesterClubs[0].characteristic_kr,
              representative: representative,
              advisor: club.SemesterClubs[0].advisor,
              totalMembers: totalMembers,
            };
          })
        );

        return {
          division: division.id,
          name: division.name,
          clubs: clubsData,
        };
      })
    );

    res.json(divisionClubsData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/club/:id", async (req, res) => {
  const clubId = req.params.id;
  if (!clubId) {
    return res.status(400).json({
      success: false,
      message: "Club ID is required as a URL parameter",
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

    // Find the club by ID, including its Division and ClubBuilding
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

    // Handle SemesterClub information and type determination
    const [semesterClubInfo, permanentClub, clubRepresentative] =
      await Promise.all([
        SemesterClub.findOne({
          where: {
            club_id: club.id,
            semester_id: currentSemester.id,
          },
          attributes: ["type_id", "characteristic_kr", "advisor"],
        }),
        PermanentClub.findOne({
          where: {
            club_id: club.id,
            start_date: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_date: { [Op.gte]: currentDate } },
              { end_date: null },
            ],
          },
        }),
        ClubRepresentative.findOne({
          where: {
            club_id: club.id,
            type_id: 1,
            start_term: { [Op.lte]: currentDate },
            [Op.or]: [
              { end_term: { [Op.gte]: currentDate } },
              { end_term: null },
            ],
          },
        }),
      ]);

    const semesterClubType = await SemesterClubType.findByPk(
      semesterClubInfo ? semesterClubInfo.type_id : 3 // Default to a type ID if not found
    );

    let clubType = permanentClub ? "상임동아리" : semesterClubType.type;

    let clubPresident = "";
    if (clubRepresentative) {
      const presidentMember = await Member.findByPk(
        clubRepresentative.student_id
      );
      clubPresident = presidentMember ? presidentMember.name : "";
    }

    // Count total members for the current semester
    const totalMembersCount = await MemberClub.count({
      where: {
        club_id: club.id,
        semester_id: currentSemester.id,
      },
    });

    // Construct the room location string
    const roomLocation =
      club.building && club.room_location
        ? `${club.building.building_name} ${club.room_location}`
        : "없음";

    res.json({
      id: club.id,
      name: club.name,
      type: clubType,
      characteristic: semesterClubInfo
        ? semesterClubInfo.characteristic_kr
        : "",
      representative: clubPresident,
      advisor: semesterClubInfo ? semesterClubInfo.advisor : null,
      totalMembers: totalMembersCount,
      divisionName: club.division.name,
      foundingYear: club.founding_year,
      room: roomLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/my", async (req, res) => {
  const student_id = 20210227; // Hardcoded student ID as per instructions

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
        .status(404)
        .json({ success: false, message: "No current semester found" });
    }

    // Fetch all semesters where the student was active
    const semesters = await MemberClub.findAll({
      where: { student_id },
      attributes: ["semester_id"],
      include: [
        {
          model: Semester,
          as: "semesters",
          attributes: ["id", "year", "semester"],
        },
      ],
      group: ["semester_id"],
      order: [
        [{ model: Semester, as: "semesters" }, "year", "DESC"],
        [{ model: Semester, as: "semesters" }, "semester", "ASC"],
      ],
    });

    const semesterDetails = await Promise.all(
      semesters.map(async (item) => {
        // Fetch clubs that the student was part of in each semester
        const memberClubs = await MemberClub.findAll({
          where: {
            student_id: student_id,
            semester_id: item.semester_id,
          },
          attributes: ["club_id"],
        });

        const clubIds = memberClubs.map((mc) => mc.club_id);

        // Fetch club details for these clubs in the current semester
        const clubs = await Club.findAll({
          where: { id: { [Op.in]: clubIds } },
          include: [
            {
              model: SemesterClub,
              as: "SemesterClubs",
              where: { semester_id: currentSemester.id },
              include: [
                {
                  model: SemesterClubType,
                  as: "type",
                  attributes: ["type"],
                },
              ],
              attributes: ["type_id", "characteristic_kr", "advisor"],
            },
          ],
          attributes: ["id", "name"],
        });

        // Format club details with representative and total members
        const formattedClubs = await Promise.all(
          clubs.map(async (club) => {
            // Fetch representative name
            const representative = await ClubRepresentative.findOne({
              where: {
                club_id: club.id,
                type_id: 1, // Assuming type_id 1 is for the president or main representative
                [Op.or]: [
                  { end_term: { [Op.gte]: currentDate } },
                  { end_term: null },
                ],
              },
              include: [{ model: Member, as: "student", attributes: ["name"] }],
            });

            // Count total members for the club in the current semester
            const totalMembersCount = await MemberClub.count({
              where: {
                club_id: club.id,
                semester_id: currentSemester.id,
              },
            });

            return {
              id: club.id,
              name: club.name,
              type: club.SemesterClubs[0]?.type?.type || "N/A", // Handling possible undefined values
              characteristic: club.SemesterClubs[0]?.characteristic_kr || "N/A",
              representative: representative
                ? representative.student.name
                : "N/A",
              advisor: club.SemesterClubs[0]?.advisor || "N/A",
              totalMembers: totalMembersCount,
            };
          })
        );

        return {
          semester: item.semester_id,
          name: `${item.semesters.year} ${item.semesters.semester}`,
          clubs: formattedClubs,
        };
      })
    );

    res.json(semesterDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
