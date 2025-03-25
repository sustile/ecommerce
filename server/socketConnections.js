const { message } = require("./controllers/messageController");
const { account } = require("./controllers/accountController");
const mongoose = require("mongoose");
const redis = require("redis");
const client = redis.createClient();

(async () => {
  await client.connect();
})();
// 6379 PORT -> REDIS

const io = require("socket.io")(5000, {
  maxHttpBufferSize: 1e8,
  cors: {
    origin: ["http://localhost:4000"],
  },
});

module.exports = io;

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("joined-server", async (id) => {
    await client.set(socket.id, id);
    await client.set(id, socket.id);
  });

  socket.on("disconnect", async () => {
    let x = await client.get(socket.id);

    setOffline(x, socket);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("send-message_dm", (data) => {
    if (data.type.includes("image")) {
    }
    socket.to(data.room).emit("receive-message_dm", data);
  });

  socket.on("edit_message-dm", (room, data) => {
    socket.to(room).emit("edit_message-dm", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("joined-call", (data) => {
    socket.to(data.room).emit("joined-call", data);
  });

  socket.on("incoming-call", (data) => {
    socket.to(data.room).emit("incoming-call", data);
  });

  socket.on("getCallData", (room) => {
    socket.to(room).emit("getCallData", room);
  });

  socket.on("end-call", (room) => {
    socket.to(room).emit("end-call", room);
  });

  socket.on("receiveCallData", (data) => {
    socket.to(data.room).emit("receiveCallData", data);
  });

  socket.on("save-dm-message", (id, fileData, data, socketId) => {
    saveMessages(id, data, socket, fileData, socketId, io);
  });

  socket.on("standalone-friend-request-verdict", async (data) => {
    let x = await client.get(data.to);
    if (x) {
      io.to(x).emit("friend-request-verdict", data);
    }
  });

  socket.on("standalone-friend-request", async (data) => {
    let x = await client.get(data.to);
    if (x) {
      io.to(x).emit("friend-request", data);
    }
  });

  socket.on("dm-call-data", (data) => {
    socket.to(data).emit("dm-call-data", data);
  });

  socket.on("dm-call-data_sent", (data) => {
    socket.to(data.dmId).emit("dm-call-data_sent", data);
  });
});

async function setOffline(userId, socket) {
  const user = await account.findOne({ _id: userId });
  if (!user) return;
  let dms = user.friends;
  dms.forEach(async (id) => {
    let x = await client.get(id);
    if (!x) return;
    socket.to(x).emit("user-offline", userId);
  });
  try {
    await client.del(socket.id);
    await client.del(userId);
  } catch (err) {}
}

async function saveMessages(userId, data, socket, otherData, socketId, io) {
  if (!data) {
    socket.to(socketId).emit("save-dm-message", {
      status: "FAIL",
    });
  }

  const user = await account.findOne({ _id: userId });
  if (!user) {
    io.to(socketId).emit("save-dm-message", {
      status: "FAIL",
    });
  }

  const x = new mongoose.Types.ObjectId().toHexString();
  if (user.dms.includes(data.dmId)) {
    let y = await message.create(
      Object.assign(
        {
          _id: x,
          userId: user._id,
          name: user.name,
        },
        data
      )
    );

    const messageObj = await message.findOne({ _id: x });
    io.to(socketId).emit("save-dm-message", {
      status: "OK",
      data: messageObj,
      ...otherData,
    });
  } else {
    io.to(socketId).emit("save-dm-message", {
      status: "FAIL",
    });
  }
}
