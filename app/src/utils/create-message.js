const formatTime = require("date-format");
// get time now
const createMessage = (messageText, username) => {
  return {
    messageText,
    createdAt: formatTime("dd/MM/yyyy - hh:mm:ss", new Date()),
    username,
  };
};

module.exports = {
  createMessage,
};
