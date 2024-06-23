// models/Chat.js
module.exports = (sequelize, DataTypes) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastMessage: {
      type: DataTypes.TEXT
    },
    users: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false
    },
    seenBy: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: []
    }
  });

  Chat.associate = (models) => {
    Chat.hasMany(models.Message, {
      foreignKey: 'chatId',
      as: 'messages'
    });
  };

  return Chat;
};
