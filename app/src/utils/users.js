let userList = [];

const findUser = (id) => userList.find((ele) => ele.id === id);
const addUser = (newUser) => (userList = [...userList, newUser]);

const removeUser = (id) => (userList = userList.filter((ele) => ele.id !== id));

const getUserList = (room) => {
  return userList.filter((ele) => ele.room === room);
};

module.exports = {
  getUserList,
  addUser,
  removeUser,
  findUser,
};
