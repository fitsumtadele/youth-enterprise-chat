// models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Chats',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Assuming you have a Users model
        key: 'id'
      }
    },
    recipientId: {  // This field is used for one-to-one chat to indicate the recipient
      type: DataTypes.UUID,
      allowNull: true, // It can be null for group chats
      references: {
        model: 'Users', // Assuming you have a Users model
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      as: 'chat'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'recipientId',
      as: 'recipient'
    });
  };

  return Message;
};
