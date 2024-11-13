require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.set("io", io);

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));
io.on("connection", (socket) => {
  socket.on("join-match", (matchId) => {
    socket.join(`match-${matchId}`);
  });
});

app.use("/api", require("./routes/matchRoutes"));
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
