'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class follower extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      follower.belongsTo(models.user, {
        foreignKey: "follower_id",
        as: 'followerInfo'
      });

      follower.belongsTo(models.user, {
        foreignKey: "follow_id",
        as: 'followingInfo'
      });
    }
  }
  follower.init({
    public_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    follow_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    follower_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("accept", "reject", 'pending'),
      defaultValue: "pending",
    },
  }, {
    sequelize,
    modelName: 'follower',
    underscored: true,
  });
  return follower;
};