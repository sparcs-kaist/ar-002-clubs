const express = require('express');
const router = express.Router()
const { Op } = require('sequelize');
const { Division, Club, SemesterClub, Semester, SemesterClubType, PermanentClub, ClubRepresentative, Member, MemberClub } = require('../models');

router.get('/division_list', async (req, res) => {
  try {
      const divisions = await Division.findAll({
          attributes: ['id', 'name'],  // id와 name 속성만 선택
          where: {
            name: {
                [Op.notIn]: ['회장', '부회장']  // '회장'과 '부회장'이 아닌 이름만 선택
            }
          }
      });
      console.log(divisions);
      res.json({
          success: true,
          data: divisions
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Internal Server Error'
      });
  }
});

router.get('/division_clubs', async (req, res) => {
  const divisionId = req.query.division_id;
  if (!divisionId) {
      return res.status(400).json({ success: false, message: 'division_id query parameter is required' });
  }

  try {
      // Get the current semester
      const currentDate = new Date();
      const currentSemester = await Semester.findOne({
          where: {
              start_date: { [Op.lte]: currentDate },
              end_date: { [Op.gte]: currentDate }
          }
      });

      // Get the clubs for the given division
      const clubs = await Club.findAll({
          where: {
              division_id: divisionId
          },
          include: [{
              model: SemesterClub,
              as: 'SemesterClubs',
              required: true,
              where: {
                  semester_id: currentSemester.id
              }
          }],
          attributes: ['id', 'name']
      });

      if (!currentSemester) {
          return res.status(404).json({ success: false, message: 'No current semester found' });
      }

      // Get the SemesterClub information for each club in the current semester
      const clubInfos = await Promise.all(clubs.map(async (club) => {
        const semesterClubInfo = await SemesterClub.findOne({
            where: {
                club_id: club.id,
                semester_id: currentSemester.id
            },
            attributes: ['type_id', 'characteristic_kr', 'advisor']
        });

        // Get the type from the SemesterClubType model
        const semesterClubType = await SemesterClubType.findByPk(semesterClubInfo.type_id);

        let clubType;
        let clubPresident = "";
        
        //PermanentClub에 club_id가 존재하고, 그 start-date가 현재보다 이전이며, end_date가 없거나, 현재보다 이후일 경우 clubType = "상임동아리", 그렇치 않을경우 clubType =  semesterClubType.type으로 설정
        const permanentClub = await PermanentClub.findOne({
            where: {
                club_id: club.id,
                start_date: { [Op.lte]: currentDate },
                [Op.or]: [
                    { end_date: { [Op.gte]: currentDate } },
                    { end_date: null }
                ]
            }
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
                    { end_term: null }
                ]
            }
        });
        if (clubRepresentative) {
            const presidentMember = await Member.findByPk(clubRepresentative.student_id);
            clubPresident = presidentMember ? presidentMember.name : "";
        }
        //MemberClub에서 currentSemester에 대해서 해당 club_id를 갖고 있는 student가 모두 몇명인지 count해서 totalMembers로 반환, 없거나 문제 생기면 0 반환
        const totalMembersCount = await MemberClub.count({
          where: {
              club_id: club.id,
              semester_id: currentSemester.id
          }
        });

        return {
            id: club.id,
            clubName: club.name,
            characteristicKr: semesterClubInfo.characteristic_kr,
            clubType: clubType,  // Use the type value from the SemesterClubType model
            clubPresident: clubPresident,
            advisor: semesterClubInfo.advisor,
            totalMembers: totalMembersCount,
        };
    }));

      res.json({
          success: true,
          data: clubInfos
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          success: false,
          message: 'Internal Server Error'
      });
  }
});

module.exports = router;
