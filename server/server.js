require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const insertDummyData = require("./utils/insertDummyData");

const app = express();
const server = http.createServer(app);
// const io = socketIO(server);
const io = socketIO(server, {
  cors: {
    origin: "*", // Allowing all origins. Change this to the frontend URL for production (e.g., 'http://localhost:3000')
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

app.set("io", io);

// db connection
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    insertDummyData();
  })
  .catch((error) => console.error("MongoDB connection error:", error));

// socket connection
io.on("connection", (socket) => {
  socket.on("join-match", (matchId) => {
    socket.join(`match-${matchId}`);
  });
});

app.use("/api", require("./routes/matchRoutes"));
const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("server is running");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
