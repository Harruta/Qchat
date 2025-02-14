import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { localMessageStorage } from '../services/messageStorage';
import { useSettingsStore } from './useSettingsStore';
//import { encryptMessage, decryptMessage } from '../utils/encryption';

export const useChatStore = create((set, get) => ({
  messages: [],
  usersWithChats: [],
  allUsers: [],
  selectedUser: null,
  isLoading: false,
  isMessagesLoading: false,

  getAllUsers: async () => {
    try {
      const res = await axiosInstance.get("/messages/users/all");
      set({ allUsers: res.data });
    } catch (error) {
      console.error("Error fetching all users:", error);
      toast.error("Failed to fetch users");
    }
  },

  getUsersWithChats: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ usersWithChats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const useLocalStorage = useSettingsStore.getState().useLocalStorage;
      
      if (useLocalStorage) {
        const messages = localMessageStorage.getAllMessages(userId);
        set({ messages });
      } else {
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({ messages: res.data });
      }
    } catch (error) {
      console.error("Get messages error:", error);
      toast.error("Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  subscribeToLocalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.on("localMessage", (message) => {
      // Optionally, you could store to local storage here as well
      set((state) => ({ messages: [...state.messages, message] }));
      console.log("Received localMessage:", message);
    });
  },

  unsubscribeFromLocalMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("localMessage");
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const useLocalStorage = useSettingsStore.getState().useLocalStorage;
    const socket = useAuthStore.getState().socket;
    const currentUser = useAuthStore.getState().authUser;
    
    try {
      if (currentUser.isTemp || useLocalStorage) {
        const newMessage = {
          _id: `local_${Date.now()}_${currentUser._id}`,
          senderId: currentUser._id,
          receiverId: selectedUser._id,
          text: messageData.text,
          image: messageData.image,
          createdAt: new Date().toISOString(),
          isLocal: true,
        };
        
        localMessageStorage.saveMessage(selectedUser._id, newMessage);
        set({ messages: [...messages, newMessage] });
        
        // Emit the message so the receiver's client receives it
        socket.emit("localMessage", {
          message: newMessage,
          receiverId: selectedUser._id,
        });
      } else {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
        set({ messages: [...messages, res.data] });
      }
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const useLocalStorage = useSettingsStore.getState().useLocalStorage;
    const currentUserId = useAuthStore.getState().authUser._id;

    const handleMessage = (message) => {
      const isMessageForCurrentChat = 
        (message.senderId === selectedUser._id && message.receiverId === currentUserId) ||
        (message.senderId === currentUserId && message.receiverId === selectedUser._id);

      if (!isMessageForCurrentChat) return;

      // Check for duplicates
      set(state => {
        const isDuplicate = state.messages.some(msg => 
          msg._id === message._id || 
          (msg.text === message.text && 
           msg.senderId === message.senderId && 
           Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 1000)
        );

        if (isDuplicate) return state;

        if (useLocalStorage) {
          localMessageStorage.saveMessage(
            message.senderId === selectedUser._id ? message.senderId : message.receiverId,
            message
          );
        }

        return { messages: [...state.messages, message] };
      });
    };

    socket.on("newMessage", handleMessage);
    socket.on("localMessage", handleMessage);

    return () => {
      socket.off("newMessage", handleMessage);
      socket.off("localMessage", handleMessage);
    };
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },
}));
