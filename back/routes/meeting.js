const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const {
  sequelize,
  Division,
  Club,
  SemesterClub,
  Semester,
  PermanentClub,
  Meeting,
  Attendance,
  Agenda,
  MeetingType,
  Member,
} = require("../models");

//TODO: 이름도 같이 뽑아서 주도록 수정
router.get("/attendance_list", async (req, res) => {
  const id = req.query.id; // 쿼리 파라미터에서 id 추출
  let attendees = [];

  if (id === "1") {
    // 정적 데이터 추가
    attendees.push({
      ClubDivision: false,
      Club: "회장",
      ClubId: 13,
      Name: "",
      PositionId: 1,
      TypeId: 1,
    });
    attendees.push({
      ClubDivision: false,
      Club: "부회장",
      ClubId: 14,
      Name: "",
      PositionId: 2,
      TypeId: 1,
    });

    // Division 모델에서 id가 13보다 작은 모든 원소 검색
    const divisions = await Division.findAll({
      where: {
        id: { [Op.lt]: 13 },
      },
    });

    // Division 데이터를 Attendee 형태로 변환하여 추가
    divisions.forEach((division) => {
      attendees.push({
        ClubDivision: false,
        Club: division.name,
        ClubId: division.id,
        Name: "",
        PositionId: 6,
        TypeId: 1,
      });
    });

    // 현재 날짜를 포함하는 Semester 검색
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (currentSemester) {
      // SemesterClub에서 현재 Semester의 모든 원소 검색 및 정렬
      const semesterClubs = await SemesterClub.findAll({
        where: {
          semester_id: currentSemester.id,
        },
        order: [["type_id", "ASC"]],
        include: [{ model: Club, as: "club", attributes: ["name"] }], // Club 모델 포함
      });

      // SemesterClub 데이터를 Attendee 형태로 변환하여 추가
      semesterClubs.forEach((sc) => {
        attendees.push({
          ClubDivision: true,
          Club: sc.club.name, // Club의 name 속성에 접근
          ClubId: sc.club_id,
          Name: "",
          PositionId: 3,
          TypeId: 1,
        });
      });
    }
  } else if (id === "2") {
    // 정적 데이터 추가
    attendees.push({
      ClubDivision: false,
      Club: "회장",
      ClubId: 13,
      Name: "",
      PositionId: 1,
      TypeId: 1,
    });
    attendees.push({
      ClubDivision: false,
      Club: "부회장",
      ClubId: 14,
      Name: "",
      PositionId: 2,
      TypeId: 1,
    });

    // Division 모델에서 id가 13보다 작은 모든 원소 검색
    const divisions = await Division.findAll({
      where: {
        id: { [Op.lt]: 13 },
      },
    });
    // Division 데이터를 Attendee 형태로 변환하여 추가
    divisions.forEach((division) => {
      attendees.push({
        ClubDivision: false,
        Club: division.name,
        ClubId: division.id,
        Name: "",
        PositionId: 6,
        TypeId: 1,
      });
    });
    const currentDate = new Date();

    // PermanentClub에서 조건을 만족하는 원소 검색 및 Club 모델 포함
    const permanentClubs = await PermanentClub.findAll({
      where: {
        start_date: { [Op.lte]: currentDate },
        [Op.or]: [{ end_date: { [Op.gte]: currentDate } }, { end_date: null }],
      },
      include: [{ model: Club, as: "club", attributes: ["name"] }],
    });

    // PermanentClub 데이터를 Attendee 형태로 변환하여 추가
    permanentClubs.forEach((pc) => {
      attendees.push({
        ClubDivision: true,
        Club: pc.club.name, // Club의 name 속성에 접근
        ClubId: pc.club_id,
        Name: "",
        PositionId: 3,
        TypeId: 1,
      });
    });
  } else if (id === "3") {
    // 정적 데이터 추가
    attendees.push({
      ClubDivision: false,
      Club: "회장",
      ClubId: 13,
      Name: "",
      PositionId: 1,
      TypeId: 1,
    });
    attendees.push({
      ClubDivision: false,
      Club: "부회장",
      ClubId: 14,
      Name: "",
      PositionId: 2,
      TypeId: 1,
    });

    // Division 모델에서 id가 13보다 작은 모든 원소 검색
    const divisions = await Division.findAll({
      where: {
        id: { [Op.lt]: 13 },
      },
    });

    // Division 데이터를 Attendee 형태로 변환하여 추가
    divisions.forEach((division) => {
      attendees.push({
        ClubDivision: false,
        Club: division.name,
        ClubId: division.id,
        Name: "",
        PositionId: 6,
        TypeId: 1,
      });
    });
  } else if (id > 4) {
    const division = id - 4;

    // 현재 날짜를 포함하는 Semester 검색
    const currentDate = new Date();
    const currentSemester = await Semester.findOne({
      where: {
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });

    if (currentSemester) {
      // SemesterClub에서 현재 Semester의 모든 원소 검색 및 정렬
      const semesterClubs = await SemesterClub.findAll({
        where: {
          semester_id: currentSemester.id,
        },
        order: [["type_id", "ASC"]],
        include: [
          {
            model: Club,
            as: "club",
            attributes: ["name", "division_id"], // division_id도 포함하여 가져옴
          },
        ],
      });

      // SemesterClub 데이터 중 division_id가 division과 일치하는 원소만 필터링하여 Attendee 형태로 변환
      semesterClubs.forEach((sc) => {
        if (sc.club.division_id === division) {
          attendees.push({
            ClubDivision: true,
            Club: sc.club.name,
            ClubId: sc.club_id,
            Name: "",
            PositionId: 3,
            TypeId: 1,
          });
        }
      });
    }
  }

  // 결과 반환
  res.json(attendees);
});

router.post("/add_meeting", async (req, res) => {
  const {
    typeId,
    meetingDivision,
    meetingDate,
    isRegular,
    attendees,
    agendas,
  } = req.body;

  try {
    // Meeting 데이터 생성
    const newMeeting = await Meeting.create({
      type_id: typeId,
      meeting_date: meetingDate,
      isRegular,
      divisionId: meetingDivision,
      editorId: req.session.user.student_id,
      // MeetingRecord, editorId 필요시 추가
    });

    // Agenda 데이터 생성
    for (const agenda of agendas) {
      await Agenda.create({
        decision_body_id: newMeeting.id,
        agenda_number: agenda.number,
        title: agenda.title,
        decision_text: agenda.decision,
        total_number: agenda.total,
        pros_number: agenda.pros,
        cons_number: agenda.cons,
        giveup_number: agenda.giveup,
      });
    }

    // Attendance 데이터 생성
    for (const attendee of attendees) {
      await Attendance.create({
        decision_body_id: newMeeting.id,
        member_student_name: attendee.Name,
        attendance_type_id: attendee.TypeId,
        position_id: attendee.PositionId,
        ClubDivision: attendee.ClubDivision,
        fromClubId: attendee.ClubDivision ? attendee.ClubId : null,
        fromDivisionId: attendee.ClubDivision ? null : attendee.ClubId,
      });
    }

    res.json({ result: newMeeting.id }); // Meeting ID 반환
  } catch (error) {
    console.error("Error in add_meeting:", error);
    res.status(500).send("Error occurred while saving the meeting");
  }
});

router.get("/detail", async (req, res) => {
  try {
    const meetingId = req.query.id;

    const meeting = await Meeting.findByPk(meetingId, {
      include: [
        { model: MeetingType, as: "type" },
        { model: Division, as: "division" },
      ],
    });
    if (!meeting) {
      return res.status(404).send("Meeting not found");
    }

    // Meeting title 구성
    const meetingDate = new Date(meeting.meeting_date);
    const year = meetingDate.getFullYear();
    const month = meetingDate.getMonth() + 1;
    const regularity = meeting.isRegular ? "정기" : "비정기";
    const meetingType = meeting.type.dataValues.type;
    const divisionName =
      meeting.type_id === 4 ? "_" + meeting.division.name : "";
    const editorId = meeting.editorId;

    const title = `${year}년 ${month}월 ${regularity} ${meetingType}${divisionName}`;
    const isRegular = meeting.isRegular;
    const division = meeting.divisionId;
    const typeId = meeting.type_id;

    // Attendees 데이터 가져오기
    const attendeesData = await Attendance.findAll({
      where: { decision_body_id: meetingId },
      include: [
        { model: Club, as: "fromClub", attributes: ["name", "division_id"] },
        { model: Division, as: "fromDivision", attributes: ["name"] },
      ],
    });

    const attendees = attendeesData.map((attendee) => {
      // Determine Club or Division based on ClubDivision flag
      let clubOrDivisionName;
      let clubOrDivisionId;
      if (attendee.ClubDivision) {
        clubOrDivisionName = attendee.fromClub
          ? attendee.fromClub.name
          : "No Club";
        clubOrDivisionId = attendee.fromClubId;
      } else {
        clubOrDivisionName = attendee.fromDivision
          ? attendee.fromDivision.name
          : "No Division";
        clubOrDivisionId = attendee.fromDivisionId;
      }

      return {
        ClubDivision: attendee.ClubDivision,
        Club: clubOrDivisionName,
        ClubId: clubOrDivisionId,
        Name: attendee.member_student_name,
        PositionId: attendee.position_id,
        TypeId: attendee.attendance_type_id,
      };
    });

    // Agendas 데이터 가져오기
    const agendasData = await Agenda.findAll({
      where: { decision_body_id: meetingId },
      order: [["agenda_number", "ASC"]],
    });

    const agendas = agendasData.map((agenda) => ({
      number: agenda.agenda_number,
      title: agenda.title,
      decision: agenda.decision_text,
      total: agenda.total_number,
      pros: agenda.pros_number,
      cons: agenda.cons_number,
      giveup: agenda.giveup_number,
    }));

    // 응답 데이터 구성
    const response = {
      title,
      meetingDate: meeting.meeting_date,
      attendees,
      agendas,
      editorId,
      isRegular,
      division,
      typeId,
    };
    res.json(response);
  } catch (error) {
    console.error("Error in /detail:", error);
    res.status(500).send("Error occurred while fetching meeting details");
  }
});

router.post("/delete", async (req, res) => {
  const meetingId = req.query.id;
  let transaction;

  try {
    // Start a transaction
    console.log("delete");
    transaction = await sequelize.transaction();
    console.log("delete");
    // Delete related records in Attendance and Agenda tables
    await Attendance.destroy(
      { where: { decision_body_id: meetingId } },
      { transaction }
    );
    await Agenda.destroy(
      { where: { decision_body_id: meetingId } },
      { transaction }
    );
    console.log("delete");
    // Delete the meeting
    await Meeting.destroy({ where: { id: meetingId } }, { transaction });
    console.log("delete");
    // Commit the transaction
    await transaction.commit();
    console.log("delete");
    res.send("Meeting and related records successfully deleted.");
  } catch (error) {
    // If an error occurs, rollback the transaction
    if (transaction) await transaction.rollback();

    console.error("Error in deleting meeting:", error);
    res.status(500).send("Error occurred while deleting the meeting");
  }
});

router.post("/edit_meeting", async (req, res) => {
  const {
    id,
    typeId,
    meetingDivision,
    meetingDate,
    isRegular,
    attendees,
    agendas,
  } = req.body;

  const transaction = await sequelize.transaction(); // Start a new transaction

  try {
    // Update Meeting
    const updatedMeeting = await Meeting.update(
      {
        type_id: typeId,
        divisionId: meetingDivision,
        meeting_date: meetingDate,
        isRegular,
      },
      { where: { id }, transaction }
    );

    // Delete and recreate Attendances
    await Attendance.destroy({ where: { decision_body_id: id }, transaction });
    for (const attendee of attendees) {
      await Attendance.create(
        {
          decision_body_id: id,
          member_student_name: attendee.Name,
          attendance_type_id: attendee.TypeId,
          position_id: attendee.PositionId,
          ClubDivision: attendee.ClubDivision,
          fromClubId: attendee.ClubDivision ? attendee.ClubId : null,
          fromDivisionId: attendee.ClubDivision ? null : attendee.ClubId,
        },
        { transaction }
      );
    }

    // Delete and recreate Agendas
    await Agenda.destroy({ where: { decision_body_id: id }, transaction });
    for (const agenda of agendas) {
      await Agenda.create(
        {
          decision_body_id: id,
          agenda_number: agenda.number,
          title: agenda.title,
          decision_text: agenda.decision,
          total_number: agenda.total,
          pros_number: agenda.pros,
          cons_number: agenda.cons,
          giveup_number: agenda.giveup,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.json({ result: id }); // Return the ID of the updated meeting
  } catch (error) {
    // Roll back the transaction in case of error
    await transaction.rollback();
    console.error("Error in /edit_meeting:", error);
    res.status(500).send("Error occurred while editing the meeting");
  }
});

router.get("/", async (req, res) => {
  const typeId = parseInt(req.query.typeId, 10) || 0;
  const pageOffset = parseInt(req.query.pageOffset, 10) || 1;
  const itemCount = parseInt(req.query.itemCount, 10) || 10;

  if (pageOffset <= 0 || itemCount <= 0) {
    return res
      .status(400)
      .send("pageOffset and itemCount must be positive integers");
  }

  const offset = (pageOffset - 1) * itemCount;
  const limit = itemCount;

  try {
    const whereClause = typeId > 0 ? { type_id: typeId } : {};

    const [meetings, totalMeetings] = await Promise.all([
      Meeting.findAll({
        where: whereClause,
        include: [
          { model: MeetingType, as: "type" },
          { model: Division, as: "division" },
          { model: Member, as: "editor", attributes: ["name"] },
        ],
        order: [["meeting_date", "DESC"]],
        offset,
        limit,
      }),
      Meeting.count({ where: whereClause }),
    ]);

    const meetingList = meetings.map((meeting) => {
      const meetingDate = new Date(meeting.meeting_date);
      const year = meetingDate.getFullYear();
      const month = meetingDate.getMonth() + 1;
      const day = meetingDate.getDate();
      const formattedDate = `${year}.${month < 10 ? "0" + month : month}.${
        day < 10 ? "0" + day : day
      }.`;
      const regularity = meeting.isRegular ? "정기" : "비정기";
      const divisionName =
        meeting.type_id === 4 ? "_" + meeting.division.name : "";
      const title = `${year}년 ${month}월 ${regularity} ${meeting.type.dataValues.type}${divisionName}`;

      return {
        id: meeting.id,
        title,
        editor: meeting.editor ? meeting.editor.name : "Unknown",
        meetingDate: formattedDate,
      };
    });

    res.json({ meetings: meetingList, total: totalMeetings });
  } catch (error) {
    console.error("Error fetching meeting list:", error);
    res.status(500).send("Error occurred while fetching the meeting list");
  }
});

module.exports = router;
