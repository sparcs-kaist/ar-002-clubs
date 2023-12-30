const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const {
  ClubRepresentative,
  SemesterClub,
  ExecutiveMember,
  Semester,
  Duration,
} = require("../models");

async function searchPermission(userData) {
  const currentDate = new Date();
  const permissions = [];

  try {
    // ClubRepresentative 테이블에서 권한 확인
    const clubReps = await ClubRepresentative.findAll({
      where: {
        student_id: userData.student_id,
        start_term: { [Sequelize.Op.lte]: currentDate },
        [Sequelize.Op.or]: [
          { end_term: null },
          { end_term: { [Sequelize.Op.gte]: currentDate } },
        ],
      },
    });

    clubReps.forEach((rep) => {
      permissions.push({ club_rep: rep.type_id, club_id: rep.club_id });
    });

    // SemesterClub 테이블에서 권한 확인
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Sequelize.Op.lte]: currentDate },
        end_date: { [Sequelize.Op.gte]: currentDate },
      },
    });

    if (currentSemester) {
      const semesterClubs = await SemesterClub.findAll({
        where: {
          semester_id: currentSemester.id,
          advisor_mail: userData.email,
        },
      });

      semesterClubs.forEach((club) => {
        permissions.push({ advisor: club.club_id });
      });
    }

    // ExecutiveMember 테이블에서 권한 확인
    const executiveMembers = await ExecutiveMember.findAll({
      where: {
        student_id: userData.student_id,
        start_term: { [Sequelize.Op.lte]: currentDate },
        [Sequelize.Op.or]: [
          { end_term: null },
          { end_term: { [Sequelize.Op.gte]: currentDate } },
        ],
      },
    });

    executiveMembers.forEach((member) => {
      permissions.push({ executive: member.type_id });
      if (member.is_admin === 1) {
        permissions.push({ admin: true });
      }
    });
    console.log(permissions);

    return permissions;
  } catch (error) {
    console.error("Error in searchPermission:", error);
    throw error;
  }
}

async function checkPermission(req, res, permissionsArray) {
  const userPermissions = await searchPermission(req.session.user);

  // const isAdmin = userPermissions.some(
  //   (permission) => permission.admin === true
  // );
  // if (isAdmin) {
  //   return userPermissions; // Always return true if user is an admin
  // }

  // 사용자 권한이 permissionsArray 내 하나 이상의 항목을 포함하는지 확인
  const isAuthorized = permissionsArray.some((permission) => {
    return Object.entries(permission).every(([key, value]) => {
      if (key === "club_rep") {
        // Special check for club_rep permissions
        if ("club_id" in permission) {
          // Check for club_rep and club_id
          return userPermissions.some(
            (up) =>
              up.club_rep !== undefined &&
              up.club_id === permission.club_id &&
              up.club_rep <= value
          );
        } else {
          // Check for club_rep only
          return userPermissions.some(
            (up) => up.club_rep !== undefined && up.club_rep <= value
          );
        }
      } else if (key === "executive") {
        // Special check for executive permissions
        return userPermissions.some(
          (up) => up.executive !== undefined && up.executive <= value
        );
      } else if (key === "advisor") {
        // Special check for advisor permissions
        if (value === 0) {
          return userPermissions.some((up) => up.hasOwnProperty("advisor"));
        } else {
          // If value is not 0, it must match exactly
          return userPermissions.some((up) => up.advisor === value);
        }
      } else {
        // General check for other permissions
        return userPermissions.some((up) => up[key] === value);
      }
    });
  });

  if (!isAuthorized) {
    // 권한이 없을 경우 요청 종료
    res.status(403).json({ error: "권한이 없습니다" });
    return false;
  }

  // 권한이 있는 경우
  return userPermissions;
}

module.exports = searchPermission;
module.exports = checkPermission;
