var DataTypes = require("sequelize").DataTypes;
var _Activity = require("./Activity");
var _ActivityEvidence = require("./ActivityEvidence");
var _ActivityEvidence_init = require("./ActivityEvidence_init");
var _ActivityFeedback = require("./ActivityFeedback");
var _ActivityFeedbackExecutive = require("./ActivityFeedbackExecutive");
var _ActivityFeedbackType = require("./ActivityFeedbackType");
var _ActivityMember = require("./ActivityMember");
var _ActivityMember_init = require("./ActivityMember_init");
var _ActivitySign = require("./ActivitySign");
var _ActivityType = require("./ActivityType");
var _Activity_init = require("./Activity_init");
var _Agenda = require("./Agenda");
var _AgendaType = require("./AgendaType");
var _Attendance = require("./Attendance");
var _AttendanceType = require("./AttendanceType");
var _CafeNotice = require("./CafeNotice");
var _Club = require("./Club");
var _ClubBuilding = require("./ClubBuilding");
var _ClubRepresentative = require("./ClubRepresentative");
var _ClubRepresentativeType = require("./ClubRepresentativeType");
var _Division = require("./Division");
var _DivisionGroup = require("./DivisionGroup");
var _DivisionPresident = require("./DivisionPresident");
var _Duration = require("./Duration");
var _ExecutiveBureau = require("./ExecutiveBureau");
var _ExecutiveMember = require("./ExecutiveMember");
var _ExecutiveType = require("./ExecutiveType");
var _Funding = require("./Funding");
var _FundingEvidence = require("./FundingEvidence");
var _FundingEvidenceType = require("./FundingEvidenceType");
var _FundingFeedbackType = require("./FundingFeedbackType");
var _FundingFixture = require("./FundingFixture");
var _FundingFixtureObjectType = require("./FundingFixtureObjectType");
var _FundingFixtureType = require("./FundingFixtureType");
var _FundingNoncorp = require("./FundingNoncorp");
var _FundingTransportation = require("./FundingTransportation");
var _FundingTransportationMember = require("./FundingTransportationMember");
var _FundingTransportationType = require("./FundingTransportationType");
var _Meeting = require("./Meeting");
var _MeetingMemberType = require("./MeetingMemberType");
var _MeetingType = require("./MeetingType");
var _Member = require("./Member");
var _MemberClub = require("./MemberClub");
var _MemberStatus = require("./MemberStatus");
var _PermanentClub = require("./PermanentClub");
var _Semester = require("./Semester");
var _SemesterClub = require("./SemesterClub");
var _SemesterClubType = require("./SemesterClubType");
var _Warning = require("./Warning");
var _sessions = require("./sessions");

function initModels(sequelize) {
  var Activity = _Activity(sequelize, DataTypes);
  var ActivityEvidence = _ActivityEvidence(sequelize, DataTypes);
  var ActivityEvidence_init = _ActivityEvidence_init(sequelize, DataTypes);
  var ActivityFeedback = _ActivityFeedback(sequelize, DataTypes);
  var ActivityFeedbackExecutive = _ActivityFeedbackExecutive(
    sequelize,
    DataTypes
  );
  var ActivityFeedbackType = _ActivityFeedbackType(sequelize, DataTypes);
  var ActivityMember = _ActivityMember(sequelize, DataTypes);
  var ActivityMember_init = _ActivityMember_init(sequelize, DataTypes);
  var ActivitySign = _ActivitySign(sequelize, DataTypes);
  var ActivityType = _ActivityType(sequelize, DataTypes);
  var Activity_init = _Activity_init(sequelize, DataTypes);
  var Agenda = _Agenda(sequelize, DataTypes);
  var AgendaType = _AgendaType(sequelize, DataTypes);
  var Attendance = _Attendance(sequelize, DataTypes);
  var AttendanceType = _AttendanceType(sequelize, DataTypes);
  var CafeNotice = _CafeNotice(sequelize, DataTypes);
  var Club = _Club(sequelize, DataTypes);
  var ClubBuilding = _ClubBuilding(sequelize, DataTypes);
  var ClubRepresentative = _ClubRepresentative(sequelize, DataTypes);
  var ClubRepresentativeType = _ClubRepresentativeType(sequelize, DataTypes);
  var Division = _Division(sequelize, DataTypes);
  var DivisionGroup = _DivisionGroup(sequelize, DataTypes);
  var DivisionPresident = _DivisionPresident(sequelize, DataTypes);
  var Duration = _Duration(sequelize, DataTypes);
  var ExecutiveBureau = _ExecutiveBureau(sequelize, DataTypes);
  var ExecutiveMember = _ExecutiveMember(sequelize, DataTypes);
  var ExecutiveType = _ExecutiveType(sequelize, DataTypes);
  var Funding = _Funding(sequelize, DataTypes);
  var FundingEvidence = _FundingEvidence(sequelize, DataTypes);
  var FundingEvidenceType = _FundingEvidenceType(sequelize, DataTypes);
  var FundingFeedbackType = _FundingFeedbackType(sequelize, DataTypes);
  var FundingFixture = _FundingFixture(sequelize, DataTypes);
  var FundingFixtureObjectType = _FundingFixtureObjectType(
    sequelize,
    DataTypes
  );
  var FundingFixtureType = _FundingFixtureType(sequelize, DataTypes);
  var FundingNoncorp = _FundingNoncorp(sequelize, DataTypes);
  var FundingTransportation = _FundingTransportation(sequelize, DataTypes);
  var FundingTransportationMember = _FundingTransportationMember(
    sequelize,
    DataTypes
  );
  var FundingTransportationType = _FundingTransportationType(
    sequelize,
    DataTypes
  );
  var Meeting = _Meeting(sequelize, DataTypes);
  var MeetingMemberType = _MeetingMemberType(sequelize, DataTypes);
  var MeetingType = _MeetingType(sequelize, DataTypes);
  var Member = _Member(sequelize, DataTypes);
  var MemberClub = _MemberClub(sequelize, DataTypes);
  var MemberStatus = _MemberStatus(sequelize, DataTypes);
  var PermanentClub = _PermanentClub(sequelize, DataTypes);
  var Semester = _Semester(sequelize, DataTypes);
  var SemesterClub = _SemesterClub(sequelize, DataTypes);
  var SemesterClubType = _SemesterClubType(sequelize, DataTypes);
  var Warning = _Warning(sequelize, DataTypes);
  var sessions = _sessions(sequelize, DataTypes);

  Club.belongsToMany(Semester, {
    as: "semester_id_Semesters",
    through: ActivitySign,
    foreignKey: "club_id",
    otherKey: "semester_id",
  });
  Club.belongsToMany(Semester, {
    as: "semester_id_Semester_SemesterClubs",
    through: SemesterClub,
    foreignKey: "club_id",
    otherKey: "semester_id",
  });
  Funding.belongsToMany(Member, {
    as: "student_id_Members",
    through: FundingTransportationMember,
    foreignKey: "funding_id",
    otherKey: "student_id",
  });
  Member.belongsToMany(Funding, {
    as: "funding_id_Fundings",
    through: FundingTransportationMember,
    foreignKey: "student_id",
    otherKey: "funding_id",
  });
  Member.belongsToMany(Semester, {
    as: "semester_id_Semester_MemberStatuses",
    through: MemberStatus,
    foreignKey: "student_id",
    otherKey: "semester_id",
  });
  Semester.belongsToMany(Club, {
    as: "club_id_Clubs",
    through: ActivitySign,
    foreignKey: "semester_id",
    otherKey: "club_id",
  });
  Semester.belongsToMany(Club, {
    as: "club_id_Club_SemesterClubs",
    through: SemesterClub,
    foreignKey: "semester_id",
    otherKey: "club_id",
  });
  Semester.belongsToMany(Member, {
    as: "student_id_Member_MemberStatuses",
    through: MemberStatus,
    foreignKey: "semester_id",
    otherKey: "student_id",
  });
  ActivityFeedback.belongsTo(Activity, {
    as: "activity_Activity",
    foreignKey: "activity",
  });
  Activity.hasMany(ActivityFeedback, {
    as: "ActivityFeedbacks",
    foreignKey: "activity",
  });
  ActivityFeedbackExecutive.belongsTo(Activity, {
    as: "activity_Activity",
    foreignKey: "activity",
  });
  Activity.hasOne(ActivityFeedbackExecutive, {
    as: "ActivityFeedbackExecutive",
    foreignKey: "activity",
  });
  Activity.belongsTo(ActivityFeedbackType, {
    as: "feedback_type_ActivityFeedbackType",
    foreignKey: "feedback_type",
  });
  ActivityFeedbackType.hasMany(Activity, {
    as: "Activities",
    foreignKey: "feedback_type",
  });
  Activity_init.belongsTo(ActivityFeedbackType, {
    as: "feedback_type_ActivityFeedbackType",
    foreignKey: "feedback_type",
  });
  ActivityFeedbackType.hasMany(Activity_init, {
    as: "Activity_inits",
    foreignKey: "feedback_type",
  });
  Activity.belongsTo(ActivityType, {
    as: "activity_type",
    foreignKey: "activity_type_id",
  });
  ActivityType.hasMany(Activity, {
    as: "Activities",
    foreignKey: "activity_type_id",
  });
  Activity_init.belongsTo(ActivityType, {
    as: "activity_type",
    foreignKey: "activity_type_id",
  });
  ActivityType.hasMany(Activity_init, {
    as: "Activity_inits",
    foreignKey: "activity_type_id",
  });
  Activity.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(Activity, { as: "Activities", foreignKey: "club_id" });
  ActivitySign.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(ActivitySign, { as: "ActivitySigns", foreignKey: "club_id" });
  Attendance.belongsTo(Club, { as: "fromClub", foreignKey: "fromClubId" });
  Club.hasMany(Attendance, { as: "Attendances", foreignKey: "fromClubId" });
  ClubRepresentative.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(ClubRepresentative, {
    as: "ClubRepresentatives",
    foreignKey: "club_id",
  });
  MemberClub.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(MemberClub, { as: "MemberClubs", foreignKey: "club_id" });
  PermanentClub.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasOne(PermanentClub, { as: "PermanentClub", foreignKey: "club_id" });
  SemesterClub.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(SemesterClub, { as: "SemesterClubs", foreignKey: "club_id" });
  Warning.belongsTo(Club, { as: "club", foreignKey: "club_id" });
  Club.hasMany(Warning, { as: "Warnings", foreignKey: "club_id" });
  Club.belongsTo(ClubBuilding, { as: "building", foreignKey: "building_id" });
  ClubBuilding.hasMany(Club, { as: "Clubs", foreignKey: "building_id" });
  ClubRepresentative.belongsTo(ClubRepresentativeType, {
    as: "type",
    foreignKey: "type_id",
  });
  ClubRepresentativeType.hasMany(ClubRepresentative, {
    as: "ClubRepresentatives",
    foreignKey: "type_id",
  });
  Attendance.belongsTo(Division, {
    as: "fromDivision",
    foreignKey: "fromDivisionId",
  });
  Division.hasMany(Attendance, {
    as: "Attendances",
    foreignKey: "fromDivisionId",
  });
  Club.belongsTo(Division, { as: "division", foreignKey: "division_id" });
  Division.hasMany(Club, { as: "Clubs", foreignKey: "division_id" });
  Meeting.belongsTo(Division, { as: "division", foreignKey: "divisionId" });
  Division.hasMany(Meeting, { as: "Meetings", foreignKey: "divisionId" });
  Division.belongsTo(DivisionGroup, {
    as: "division_group",
    foreignKey: "division_group_id",
  });
  DivisionGroup.hasMany(Division, {
    as: "Divisions",
    foreignKey: "division_group_id",
  });
  ExecutiveMember.belongsTo(ExecutiveBureau, {
    as: "main_bureau_ExecutiveBureau",
    foreignKey: "main_bureau",
  });
  ExecutiveBureau.hasMany(ExecutiveMember, {
    as: "ExecutiveMembers",
    foreignKey: "main_bureau",
  });
  ExecutiveMember.belongsTo(ExecutiveBureau, {
    as: "sub_bureau_ExecutiveBureau",
    foreignKey: "sub_bureau",
  });
  ExecutiveBureau.hasMany(ExecutiveMember, {
    as: "sub_bureau_ExecutiveMembers",
    foreignKey: "sub_bureau",
  });
  ActivityFeedbackExecutive.belongsTo(ExecutiveMember, {
    as: "student",
    foreignKey: "student_id",
  });
  ExecutiveMember.hasMany(ActivityFeedbackExecutive, {
    as: "ActivityFeedbackExecutives",
    foreignKey: "student_id",
  });
  ExecutiveMember.belongsTo(ExecutiveType, {
    as: "type",
    foreignKey: "type_id",
  });
  ExecutiveType.hasMany(ExecutiveMember, {
    as: "ExecutiveMembers",
    foreignKey: "type_id",
  });
  FundingEvidence.belongsTo(Funding, {
    as: "funding",
    foreignKey: "funding_id",
  });
  Funding.hasMany(FundingEvidence, {
    as: "FundingEvidences",
    foreignKey: "funding_id",
  });
  FundingFixture.belongsTo(Funding, {
    as: "funding",
    foreignKey: "funding_id",
  });
  Funding.hasMany(FundingFixture, {
    as: "FundingFixtures",
    foreignKey: "funding_id",
  });
  FundingNoncorp.belongsTo(Funding, {
    as: "funding",
    foreignKey: "funding_id",
  });
  Funding.hasMany(FundingNoncorp, {
    as: "FundingNoncorps",
    foreignKey: "funding_id",
  });
  FundingTransportation.belongsTo(Funding, {
    as: "funding",
    foreignKey: "funding_id",
  });
  Funding.hasMany(FundingTransportation, {
    as: "FundingTransportations",
    foreignKey: "funding_id",
  });
  FundingTransportationMember.belongsTo(Funding, {
    as: "funding",
    foreignKey: "funding_id",
  });
  Funding.hasMany(FundingTransportationMember, {
    as: "FundingTransportationMembers",
    foreignKey: "funding_id",
  });
  FundingEvidence.belongsTo(FundingEvidenceType, {
    as: "funding_evidence_type",
    foreignKey: "funding_evidence_type_id",
  });
  FundingEvidenceType.hasMany(FundingEvidence, {
    as: "FundingEvidences",
    foreignKey: "funding_evidence_type_id",
  });
  Funding.belongsTo(FundingFeedbackType, {
    as: "funding_feedback_type_FundingFeedbackType",
    foreignKey: "funding_feedback_type",
  });
  FundingFeedbackType.hasMany(Funding, {
    as: "Fundings",
    foreignKey: "funding_feedback_type",
  });
  FundingFixture.belongsTo(FundingFixtureObjectType, {
    as: "fixture_type",
    foreignKey: "fixture_type_id",
  });
  FundingFixtureObjectType.hasMany(FundingFixture, {
    as: "FundingFixtures",
    foreignKey: "fixture_type_id",
  });
  FundingFixture.belongsTo(FundingFixtureType, {
    as: "funding_fixture_type",
    foreignKey: "funding_fixture_type_id",
  });
  FundingFixtureType.hasMany(FundingFixture, {
    as: "FundingFixtures",
    foreignKey: "funding_fixture_type_id",
  });
  FundingTransportation.belongsTo(FundingTransportationType, {
    as: "transportation_type",
    foreignKey: "transportation_type_id",
  });
  FundingTransportationType.hasMany(FundingTransportation, {
    as: "FundingTransportations",
    foreignKey: "transportation_type_id",
  });
  Meeting.belongsTo(MeetingType, { as: "type", foreignKey: "type_id" });
  MeetingType.hasMany(Meeting, { as: "Meetings", foreignKey: "type_id" });
  ActivityFeedback.belongsTo(Member, {
    as: "student",
    foreignKey: "student_id",
  });
  Member.hasMany(ActivityFeedback, {
    as: "ActivityFeedbacks",
    foreignKey: "student_id",
  });
  ActivityMember.belongsTo(Member, {
    as: "member_student",
    foreignKey: "member_student_id",
  });
  Member.hasMany(ActivityMember, {
    as: "ActivityMembers",
    foreignKey: "member_student_id",
  });
  ActivityMember_init.belongsTo(Member, {
    as: "member_student",
    foreignKey: "member_student_id",
  });
  Member.hasMany(ActivityMember_init, {
    as: "ActivityMember_inits",
    foreignKey: "member_student_id",
  });
  ClubRepresentative.belongsTo(Member, {
    as: "student",
    foreignKey: "student_id",
  });
  Member.hasMany(ClubRepresentative, {
    as: "ClubRepresentatives",
    foreignKey: "student_id",
  });
  ExecutiveMember.belongsTo(Member, {
    as: "student",
    foreignKey: "student_id",
  });
  Member.hasMany(ExecutiveMember, {
    as: "ExecutiveMembers",
    foreignKey: "student_id",
  });
  FundingTransportationMember.belongsTo(Member, {
    as: "student",
    foreignKey: "student_id",
  });
  Member.hasMany(FundingTransportationMember, {
    as: "FundingTransportationMembers",
    foreignKey: "student_id",
  });
  Meeting.belongsTo(Member, { as: "editor", foreignKey: "editorId" });
  Member.hasMany(Meeting, { as: "Meetings", foreignKey: "editorId" });
  MemberClub.belongsTo(Member, { as: "student", foreignKey: "student_id" });
  Member.hasMany(MemberClub, { as: "MemberClubs", foreignKey: "student_id" });
  MemberStatus.belongsTo(Member, { as: "student", foreignKey: "student_id" });
  Member.hasMany(MemberStatus, {
    as: "MemberStatuses",
    foreignKey: "student_id",
  });
  MemberClub.belongsTo(MemberStatus, {
    as: "semester",
    foreignKey: "semester_id",
  });
  MemberStatus.hasMany(MemberClub, {
    as: "MemberClubs",
    foreignKey: "semester_id",
  });
  ActivitySign.belongsTo(Semester, {
    as: "semester",
    foreignKey: "semester_id",
  });
  Semester.hasMany(ActivitySign, {
    as: "ActivitySigns",
    foreignKey: "semester_id",
  });
  Duration.belongsTo(Semester, { as: "semester", foreignKey: "semester_id" });
  Semester.hasMany(Duration, { as: "Durations", foreignKey: "semester_id" });
  MemberStatus.belongsTo(Semester, {
    as: "semester",
    foreignKey: "semester_id",
  });
  Semester.hasMany(MemberStatus, {
    as: "MemberStatuses",
    foreignKey: "semester_id",
  });
  SemesterClub.belongsTo(Semester, {
    as: "semester",
    foreignKey: "semester_id",
  });
  Semester.hasMany(SemesterClub, {
    as: "SemesterClubs",
    foreignKey: "semester_id",
  });
  SemesterClub.belongsTo(SemesterClubType, {
    as: "type",
    foreignKey: "type_id",
  });
  SemesterClubType.hasMany(SemesterClub, {
    as: "SemesterClubs",
    foreignKey: "type_id",
  });

  return {
    Activity,
    ActivityEvidence,
    ActivityEvidence_init,
    ActivityFeedback,
    ActivityFeedbackExecutive,
    ActivityFeedbackType,
    ActivityMember,
    ActivityMember_init,
    ActivitySign,
    ActivityType,
    Activity_init,
    Agenda,
    AgendaType,
    Attendance,
    AttendanceType,
    CafeNotice,
    Club,
    ClubBuilding,
    ClubRepresentative,
    ClubRepresentativeType,
    Division,
    DivisionGroup,
    DivisionPresident,
    Duration,
    ExecutiveBureau,
    ExecutiveMember,
    ExecutiveType,
    Funding,
    FundingEvidence,
    FundingEvidenceType,
    FundingFeedbackType,
    FundingFixture,
    FundingFixtureObjectType,
    FundingFixtureType,
    FundingNoncorp,
    FundingTransportation,
    FundingTransportationMember,
    FundingTransportationType,
    Meeting,
    MeetingMemberType,
    MeetingType,
    Member,
    MemberClub,
    MemberStatus,
    PermanentClub,
    Semester,
    SemesterClub,
    SemesterClubType,
    Warning,
    sessions,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
