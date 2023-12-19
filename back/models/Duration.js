const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Duration', {
    duration_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    semester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Semester',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Duration',
    timestamps: false,
    indexes: [
      {
        name: "Duration_pk",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "duration_name" },
          { name: "semester_id" },
        ]
      },
      {
        name: "Duration_Semester_id_fk",
        using: "BTREE",
        fields: [
          { name: "semester_id" },
        ]
      },
    ]
  });
};
