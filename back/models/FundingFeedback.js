const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FundingFeedback', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    funding: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Funding',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    added_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'FundingFeedback',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "FundingFeedback_Funding_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding" },
        ]
      },
      {
        name: "FundingFeedback_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
    ]
  });
};
