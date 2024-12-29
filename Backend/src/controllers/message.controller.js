import User from "../models/user.model.js";
import Message from "../models/message.models.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne:loggedInUserId}}).seclect("_password");

        res.status(200)(filteredUsers);
    } catch(error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal Server error"});
    }
};

export const getMessages = async (req, res) => {
    try{
        const { id:userToChatId } = req.params
        const myId = req.user._id;

        const message = await Message.find({
            $or:[
                {senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })
    }catch (error) {
        console.error("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
};

export const sendMessages = async (req, res) => {
    try{
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            // Upload base 64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = newMessage({
            senderId,
            receivedId,
            text,
            image: imageUrl
        });
        await newMessage.save();
        //todo: realtime functionality-> socket.io

        res.status(201).json(newMessage);
    } catch(error){
        console.log("Error in sendMessage controler: ", error.message);
        res.status(500).json({ error: "Internal server error"});
    }
}