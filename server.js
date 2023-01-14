const express = require("express");
const app = express();

const port = 9000;
const path = require("path");

const http = require("http").Server(app);
let list_of_clients = [];
const list_of_msgs = [];
// Attach http server to socket.io

const io = require("socket.io")(http);

io.on("connection", (socket) => {
  socket.on("newConnection", (msg) => {
    msg = JSON.parse(msg);
  });

  // console.log(socket.handshake.headers);
  list_of_clients.push(socket);

  list_of_clients.map((element) => {
    io.emit("total_clients", element.id);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
    console.log(`disconnected socket id: ${socket.id}`);
    const local_list = [];
    for (var i = 0; i < list_of_clients.length; i++) {
      local_list.push(list_of_clients[i].id);
    }
    list_of_clients = list_of_clients.filter((element) => {
      if (element.id === socket.id) {
        return true;
      } else {
        return false;
      }
    });
    list_of_clients.map((element) => {
      io.emit("total_clients", element.id);
    });
  });

  function sendMsgs(socketInstance) {
    if (list_of_msgs.length !== 0) {
      list_of_msgs.map((element) => {
        for (var i = 0; i < list_of_clients.length; i++) {
          if (
            list_of_clients[i].id == element.recId &&
            socketInstance.id == element.senderId
          ) {
            list_of_clients[i].emit("chatMsg", element.textmsg);
          }
        }
      });
    }
  }

  socket.emit("server", socket.id);

  socket.on("message", (textmsg) => {
    textmsg = JSON.parse(textmsg);
    list_of_msgs.push(textmsg);
    sendMsgs(socket);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./view/index.html"));
});

http.listen(port, () => {
  console.log("Http running");
});
