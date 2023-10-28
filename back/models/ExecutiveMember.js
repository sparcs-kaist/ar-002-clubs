const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ExecutiveMember', {
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Member',
        key: 'student_id'
      }
    },
    main_officer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sub_officer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_term: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_term: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'ExecutiveMember',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
    ]
  });
};
