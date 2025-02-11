const LOCAL_MESSAGES_KEY = 'chat-messages';

export const localMessageStorage = {
  getAllMessages: (chatId) => {
    const messages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
    return messages[chatId] || [];
  },

  saveMessage: (chatId, message) => {
    const messages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
    if (!messages[chatId]) messages[chatId] = [];
    messages[chatId].push(message);
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
    return message;
  },

  clearMessages: (chatId) => {
    const messages = JSON.parse(localStorage.getItem(LOCAL_MESSAGES_KEY) || '{}');
    delete messages[chatId];
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  }
}; 