const http = require("http");
const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessages, generateLocation } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  socket.on("join", (options, callback) => {
    const {error, user} = addUser({id: socket.id, ...options})
    if(error){
      return callback(error)
    }

    socket.join(user.room_name);
    socket.emit("message", generateMessages("System","Welcome!"));
    socket.broadcast
      .to(user.room_name)
      .emit("message", generateMessages("System", `${user.user_name} has joined`));
    io.to(user.room_name).emit("roomData",{
      room_name: user.room_name,
      user_list: getUserInRoom(user.room_name)
    })

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed.");
    }
    io.to(user.room_name).emit("message", generateMessages(user.user_name, message));
    // callback("Delivered")
    callback();
  });

  socket.on("sendLocation", (pos, callback) => {
    const user = getUser(socket.id);
    io.to(user.room_name).emit(
      "locationMessage",
      generateLocation(user.user_name,`https://google.com/maps?q=${pos.lat},${pos.long}`)
    );
    callback("Shared!");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if(user){
      io.to(user.room_name).emit("message", generateMessages("System",`${user.user_name} has left`));
      io.to(user.room_name).emit("roomData",{
        room_name: user.room_name,
        user_list: getUserInRoom(user.room_name)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`server is listening port ${port}.`);
});
