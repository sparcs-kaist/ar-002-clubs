const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Registration', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    club_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Club',
        key: 'id'
      }
    },
    type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'RegistrationType',
        key: 'type_id'
      }
    },
    feedback_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'ActivityFeedbackType',
        key: 'id'
      }
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Semester',
        key: 'id'
      }
    },
    prev_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    current_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    founding_month: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    founding_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    phone_number: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    division: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Division',
        key: 'id'
      }
    },
    is_advisor: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    advisor_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    advisor_email: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    advisor_level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    characteristic_kr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    characteristic_en: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    division_consistency: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    main_plan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    advisor_plan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recent_edit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    recent_feedback: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Registration',
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
        name: "Registration_Club_id_fk",
        using: "BTREE",
        fields: [
          { name: "club_id" },
        ]
      },
      {
        name: "Registration_Division_id_fk",
        using: "BTREE",
        fields: [
          { name: "division" },
        ]
      },
      {
        name: "Registration_RegistrationType_type_id_fk",
        using: "BTREE",
        fields: [
          { name: "type_id" },
        ]
      },
      {
        name: "Registration_Semester_id_fk",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
      {
        name: "Registration_Member_student_id_fk",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "Registration_ActivityFeedbackType_id_fk",
        using: "BTREE",
        fields: [
          { name: "feedback_type" },
        ]
      },
    ]
  });
};
