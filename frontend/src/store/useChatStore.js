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
  selectedUser: null,
  isLoading: false,
  isMessagesLoading: false,

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

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const useLocalStorage = useSettingsStore.getState().useLocalStorage;
    
    try {
      if (useLocalStorage) {
        const newMessage = {
          _id: Date.now().toString(),
          senderId: useAuthStore.getState().authUser._id,
          receiverId: selectedUser._id,
          text: messageData.text,
          image: messageData.image,
          createdAt: new Date().toISOString(),
        };

        await localMessageStorage.saveMessage(selectedUser._id, newMessage);
        set({ messages: [...messages, newMessage] });
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

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },
}));
