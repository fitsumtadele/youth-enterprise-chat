const { Chat, Message, User } = require("../models");
const { Op } = require("sequelize");

const createChat = async (req, res) => {
  const { users, listingId } = req.body;
  try {
    // Check if a chat already exists for the given users and listingId
    let chat = await Chat.findOne({
      where: {
        users: { [Op.contains]: users },
        listingId: listingId
      }
    });

    // If no chat exists, create one
    if (!chat) {
      chat = await Chat.create({
        users,
        listingId
      });
    }

    res.status(201).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create chat!" });
  }
};

const getChats = async (req, res) => {
  const userId = req.userId;
  try {
    const chats = await Chat.findAll({
      where: {
        users: { [Op.contains]: [userId] }
      }
    });
    const chatsWithUserNames = await Promise.all(
      chats.map(async (chat) => {
          const otherUsers = await User.findAll({
            where: {
              id: { [Op.in]: chat.users, [Op.ne]: userId } //
            },
            attributes: ['id', 'username']
          });
          return {
            ...chat.toJSON(),
            otherUsers
          };
      })
    );
    console.log(chatsWithUserNames);
    res.status(200).json({ success: true, chats: chatsWithUserNames });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to get chats!" });
  }
};

const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await Message.findAll({
      where: { chatId },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get chat messages!" });
  }
};

const getListingMessages = async (req, res) => {
  const { ownerId, listingId, chatId } = req.body;
  const userId = req.userId;
  // const users = [userId, ownerId];
  console.log({ ownerId, listingId, chatId })
  const user = ownerId? await User.findOne({
    where: {
      id: ownerId
    }
  }):null;
  try {
    let chat = null;
    if(chatId) {
      console.log("With Chat Id")
      chat = await Chat.findOne({
        where: {
          id: chatId
        }
      });
    }
    else {
      chat = await Chat.findOne({
        where: {
          users: { [Op.contains]: [userId] },
          listingId: listingId
        }
      });
    }
    if(!chat || chat == null) {
      return res.status(200).json({success:true,messages:[],user});
      // chat = await Chat.create({
      //   users,
      //   listingId
      // });
    }
    console.log({chat})

    const messages = await Message.findAll({
      where: { chatId:chat.id },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'email'] // Include necessary fields
        },
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'username', 'email'] // Include necessary fields
        }
      ]
    });
    let userResponse = user ? user.toJSON() : null;
    if (userResponse) {
      userResponse.chatId = chat.id;
    }
    res.status(200).json({success:true,messages,user:userResponse});
  } catch (err) {
    console.log("getListingMessages", err);
    res.status(500).json({ message: "Failed to get chat messages!" });
  }
};

const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  const senderId = req.userId;
  try {
    const message = await Message.create({
      chatId,
      senderId,
      content
    });
    res.status(201).json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send message!" });
  }
};

module.exports = {
  createChat,
  getChats,
  getChatMessages,
  getListingMessages,
  sendMessage
};
