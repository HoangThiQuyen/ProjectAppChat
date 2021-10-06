const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { createMessage } = require("./utils/create-message");
const { getUserList, addUser, removeUser, findUser } = require("./utils/users");

// để cáu hình file public/index chạy trước
const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

//taoj server
const server = http.createServer(app);

// khoi tao socket
const io = socketio(server);

//lang nghe su kien ket noi tu client(html) và đc cung cấp 1 cái socket
io.on("connection", (socket) => {
  // console.log('new client connect');

  // xử lý join room
  socket.on("Join Room from client", ({ room, username }) => {
    socket.join(room);

    // gửi cho client vừa mới kết nối vào
    socket.emit(
      "send message from server",
      createMessage(`Welcome you go ${room} room`, "Admin")
    );

    // gửi cho các client còn lại
    socket.broadcast
      .to(room)
      .emit(
        "send message from server",
        createMessage(`${username} connect ${room} room`, "Admin")
      );

    //chat
    //.on lắng nghe sự kiện
    socket.on("send message from client", (messageText, callback) => {
      const filter = new Filter();
      filter.addWords("chó", "má", "ngu", "cặc", "cac");
      if (filter.isProfane(messageText)) {
        return callback(
          "Message không hợp lệ, vì chứa từ khóa vi phạm cộng đồng"
        );
      }
      //tìm user
      const user = findUser(socket.id);
      // dùng io để tất cả client trong server đều nhận được
      // nếu .to(tên phòng) thì chỉ  các client trong phòng nhận được
      io.to(room).emit(
        "send message from server",
        createMessage(messageText, user.username)
      );
      callback();
    });

    // xử lý chia sẽ vị trí
    socket.on("share location from client", ({ latitude, longitude }) => {
      const user = findUser(socket.id);
      const linkLocation = `https://www.google.com/maps/?q=${latitude},${longitude}`;
      io.to(room).emit(
        "share location from server",
        createMessage(linkLocation, user.username)
      );
    });

    // add user
    const newUser = {
      id: socket.id, //hoặc dùng Math.random().toString(26).substr(2, 5)
      username,
      room,
    };
    addUser(newUser);

    //xử lý userList
    io.to(room).emit("send userList from server", getUserList(room));

    // ngắt kết nối
    socket.on("disconnect", () => {
      // console.log("client left server");

      //remove user
      removeUser(socket.id);
      io.to(room).emit("send userList from server", getUserList(room));
    });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
