const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DivisionPresident', {
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    term_start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    term_end: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    originated_club_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    member_student_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'DivisionPresident',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "division_id" },
        ]
      },
    ]
  });
};
