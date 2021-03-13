const users = [];

const toCamelCase = (sentenceCase) => {
  var out = "";
  sentenceCase.split(" ").forEach(function (el, idx) {
    var add = el.toLowerCase();
    out += idx === 0 ? add : add[0].toUpperCase() + add.slice(1);
  });
  return out;
};

const addUser = ({ id, user_name, room_name }) => {
  user_name = toCamelCase(user_name.trim().toLowerCase())
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
  room_name = room_name.trim().toLowerCase();

  // Validation user & room
  if (!user_name || !room_name) {
    return {
      error: "User & Room names are required.",
    };
  }

  // check for existing user
  const existingUser = users.find((user) => {
    return user.user_name === user_name && user.room_name === room_name;
  });

  // validation for user
  if (existingUser) {
    return {
      error: "User name is in use.",
    };
  }

  // store user
  const user = { id, user_name, room_name };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room_name === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
};
