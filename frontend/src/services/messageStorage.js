import { encryptMessage, decryptMessage } from "../utils/encryption";

// Prefix for localStorage key
const STORAGE_KEY_PREFIX = "chat_messages_";

// Helper to get raw (encrypted) messages from localStorage
const getRawMessages = (userId) => {
  const key = STORAGE_KEY_PREFIX + userId;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const localMessageStorage = {
  // Retrieve and decrypt all messages for a given user
  getAllMessages: (userId) => {
    const rawMessages = getRawMessages(userId);
    return rawMessages.map((msg) => {
      if (msg.text) {
        return { ...msg, text: decryptMessage(msg.text) };
      }
      return msg;
    });
  },

  // Encrypt the new message and save it along with the already-encrypted messages
  saveMessage: (userId, message) => {
    const key = STORAGE_KEY_PREFIX + userId;
    const rawMessages = getRawMessages(userId);
    const encryptedMessage = {
      ...message,
      text: message.text ? encryptMessage(message.text) : "",
    };
    rawMessages.push(encryptedMessage);
    localStorage.setItem(key, JSON.stringify(rawMessages));
  },

  clearMessages: (userId) => {
    const key = STORAGE_KEY_PREFIX + userId;
    localStorage.removeItem(key);
  },
}; 