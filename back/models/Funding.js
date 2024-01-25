const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Funding', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    expenditure_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expenditure_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    approved_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    purpose: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    is_transportation: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_non_corporate_transaction: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_food_expense: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_labor_contract: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_external_event_participation_fee: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_publication: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_profit_making_activity: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    is_joint_expense: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    additional_explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    funding_feedback_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FundingFeedbackType',
        key: 'type_id'
      }
    },
    funding_executive: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    is_committee: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    recent_edit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    recent_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Funding',
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
        name: "funding_feedback_type",
        using: "BTREE",
        fields: [
          { name: "funding_feedback_type" },
        ]
      },
      {
        name: "Funding_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "funding_executive" },
        ]
      },
    ]
  });
};
