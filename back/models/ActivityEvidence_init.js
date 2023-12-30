const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ActivityEvidence_init', {
    activity_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(511),
      allowNull: false,
      primaryKey: true
    }
  }, {
    sequelize,
    tableName: 'ActivityEvidence_init',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "description" },
          { name: "activity_id" },
        ]
      },
    ]
  });
};
