// yeu cau server ket noi voi client
const socket = io();

//gửi message
document.getElementById("form-message").addEventListener("submit", (e) => {
  e.preventDefault();
  const messageText = document.getElementById("input-message").value;
  //là tham số thứ 3 của emit
  const asknowledgements = (errors) => {
    if (errors) {
      return alert("Message không hợp lệ");
    }
    console.log("You send message successs");
  };
  // dưới client không có io, nên chỉ dùng socket
  socket.emit("send message from client", messageText, asknowledgements);
  // clear input message
  document.getElementById("input-message").value = "";
});
// lấy message từ server
socket.on("send message from server", (message) => {
  console.log(message);
  // hiển thị lên giao diện
  const { messageText, createdAt, username } = message;
  const contentHtml = document.getElementById("app__messages").innerHTML;
  let messageHtml = `<div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${createdAt}</p>
  </div>
  <div class="message__row2">
    <p class="message__content">
    ${messageText}
    </p>
  </div>
</div>`;

  document.getElementById("app__messages").innerHTML =
    contentHtml + messageHtml;
});

// gửi vị trí
document.getElementById("btn-share-location").addEventListener("click", () => {
  //navigator là thanh điều hướng.geolocation là lấy vị trí.getCurrentPosition là lấy vị trí hiện tại của ta đang ở( vệ tinh gg làm cho)
  if (!navigator.geolocation) {
    return alert("Browser no support find location!");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    const { latitude, longitude } = position.coords;
    socket.emit("share location from client", {
      latitude,
      longitude,
    });
  });
});

//lấy link vị trí từ server
socket.on("share location from server", (location) => {
  console.log(location);
  const { messageText, createdAt, username } = location;
  const contentHtml = document.getElementById("app__messages").innerHTML;
  let messageHtml = `<div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${createdAt}</p>
  </div>
  <div class="message__row2">
    <p class="message__content">
    <a href=' ${messageText}' target="_blank">Location of ${username} </a>
    </p>
  </div>
</div>`;

  document.getElementById("app__messages").innerHTML =
    contentHtml + messageHtml;
});

// Xử lý query string(chuỗi trên thanh url mà form mới gửi lên và parse về obj)
const queryString = location.search;
//ignoreQueryPrefix : loại bỏ dấu ? phía trước Query
const params = Qs.parse(queryString, { ignoreQueryPrefix: true });
const { room, username } = params;

// join room
socket.emit("Join Room from client", { room, username });

//hiển thị tên phòng lên giao diện
document.getElementById("app__title").innerHTML = room;

//xử lý userList
socket.on("send userList from server", (userList) => {
  let contentHtml = "";
  userList.map(
    (ele) =>
      (contentHtml += `
 <li class="app__item-user">${ele.username}</li>
 `)
  );
  document.getElementById("app__list-user--content").innerHTML = contentHtml;
});
