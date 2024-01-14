const express = require("express");
const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");
const cors = require("cors");
require("dotenv").config();

// MongoDB connection
mongoose
  .connect(process.env.mongoDb)
  .then(() => {
    console.log("Mongodb Connected");
    app.listen(process.env.port || 3000, () => {
      console.log("Server listening on port " + process.env.port || 3000);
    });
  })
  .catch((error) => console.log(error));

// Middleware
app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

// Main Page
app.get("/", (req, res) => {
  res.send({
    status: 200,
    error: false,
    message: "API is working fine with nodemon",
  });
});

// Routes
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
