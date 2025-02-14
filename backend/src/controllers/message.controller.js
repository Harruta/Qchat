import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where the current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    // Get unique user IDs from messages
    const userIds = messages.reduce((users, message) => {
      if (message.senderId.toString() !== userId.toString()) {
        users.add(message.senderId.toString());
      }
      if (message.receiverId.toString() !== userId.toString()) {
        users.add(message.receiverId.toString());
      }
      return users;
    }, new Set());

    // Get user details for all participants (excluding the current user)
    const users = await User.find({
      _id: { $in: Array.from(userIds) }
    }).select("-password -email");

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Store encrypted message in database
    const newMessage = new Message({
      senderId,
      receiverId,
      text, // Text is already encrypted from frontend
      image: imageUrl,
    });

    await newMessage.save();

    // Send encrypted message through socket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    
    // Find all users except the current user
    const users = await User.find({ 
      _id: { $ne: currentUserId } 
    }).select("-password").sort({ fullName: 1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
