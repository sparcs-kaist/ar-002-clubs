var DataTypes = require("sequelize").DataTypes;
var _Club = require("./Club");
var _Division = require("./Division");
var _DivisionGroup = require("./DivisionGroup");
var _Member = require("./Member");
var _MemberClub = require("./MemberClub");
var _MemberStatus = require("./MemberStatus");
var _Post = require("./Post");
var _SemesterActivity = require("./SemesterActivity");
var _SemesterClub = require("./SemesterClub");

function initModels(sequelize) {
  var Club = _Club(sequelize, DataTypes);
  var Division = _Division(sequelize, DataTypes);
  var DivisionGroup = _DivisionGroup(sequelize, DataTypes);
  var Member = _Member(sequelize, DataTypes);
  var MemberClub = _MemberClub(sequelize, DataTypes);
  var MemberStatus = _MemberStatus(sequelize, DataTypes);
  var Post = _Post(sequelize, DataTypes);
  var SemesterActivity = _SemesterActivity(sequelize, DataTypes);
  var SemesterClub = _SemesterClub(sequelize, DataTypes);

  Club.belongsToMany(SemesterActivity, { as: 'activity_id_SemesterActivity_SemesterClubs', through: SemesterClub, foreignKey: "club_id", otherKey: "activity_id" });
  Member.belongsToMany(SemesterActivity, { as: 'activity_id_SemesterActivities', through: MemberStatus, foreignKey: "student_id", otherKey: "activity_id" });
  SemesterActivity.belongsToMany(Club, { as: 'club_id_Clubs', through: SemesterClub, foreignKey: "activity_id", otherKey: "club_id" });
  SemesterActivity.belongsToMany(Member, { as: 'student_id_Members', through: MemberStatus, foreignKey: "activity_id", otherKey: "student_id" });
  MemberClub.belongsTo(Club, { as: "club", foreignKey: "club_id"});
  Club.hasMany(MemberClub, { as: "MemberClubs", foreignKey: "club_id"});
  SemesterClub.belongsTo(Club, { as: "club", foreignKey: "club_id"});
  Club.hasMany(SemesterClub, { as: "SemesterClubs", foreignKey: "club_id"});
  Club.belongsTo(Division, { as: "division", foreignKey: "division_id"});
  Division.hasMany(Club, { as: "Clubs", foreignKey: "division_id"});
  Division.belongsTo(DivisionGroup, { as: "division_group", foreignKey: "division_group_id"});
  DivisionGroup.hasMany(Division, { as: "Divisions", foreignKey: "division_group_id"});
  MemberClub.belongsTo(Member, { as: "student", foreignKey: "student_id"});
  Member.hasMany(MemberClub, { as: "MemberClubs", foreignKey: "student_id"});
  MemberStatus.belongsTo(Member, { as: "student", foreignKey: "student_id"});
  Member.hasMany(MemberStatus, { as: "MemberStatuses", foreignKey: "student_id"});
  SemesterClub.belongsTo(Member, { as: "president", foreignKey: "president_id"});
  Member.hasMany(SemesterClub, { as: "SemesterClubs", foreignKey: "president_id"});
  SemesterClub.belongsTo(Member, { as: "vice_president", foreignKey: "vice_president_id"});
  Member.hasMany(SemesterClub, { as: "vice_president_SemesterClubs", foreignKey: "vice_president_id"});
  MemberClub.belongsTo(SemesterActivity, { as: "activity", foreignKey: "activity_id"});
  SemesterActivity.hasMany(MemberClub, { as: "MemberClubs", foreignKey: "activity_id"});
  MemberStatus.belongsTo(SemesterActivity, { as: "activity", foreignKey: "activity_id"});
  SemesterActivity.hasMany(MemberStatus, { as: "MemberStatuses", foreignKey: "activity_id"});
  SemesterClub.belongsTo(SemesterActivity, { as: "activity", foreignKey: "activity_id"});
  SemesterActivity.hasMany(SemesterClub, { as: "SemesterClubs", foreignKey: "activity_id"});

  return {
    Club,
    Division,
    DivisionGroup,
    Member,
    MemberClub,
    MemberStatus,
    Post,
    SemesterActivity,
    SemesterClub,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
