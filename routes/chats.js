const app = require("express");
const router = app.Router();
const ChatModel = require("../model/chats");
require("dotenv").config();

// Get all chats
router.get("/", async (req, res) => {
  try {
    const chats = await ChatModel.find();
    res.status(200).send({
      status: 200,
      error: false,
      message: "All chats fetched",
      chats,
    });
  } catch (error) {
    res
      .status(500)
      .send({ status: 500, error: true, message: "Internal server error" });
  }
});

// Get a single chat
router.get("/:id", async (req, res) => {
  try {
    const chat = await ChatModel.findById(req.params.id)
      .populate("user")
      .exec();

    if (!chat) {
      let error = Error("chat not found");
      error.code = 404;
      throw error;
    }
    res
      .status(200)
      .send({ status: 200, error: false, message: "chat found", chat });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

// Get chats by user ID
router.get("/findByUserId/:id", async (req, res) => {
  try {
    const chats = await ChatModel.find({ user: req.params.id })
      .populate("user")
      .exec();
    res.status(200).send({
      status: 200,
      error: false,
      message: `chats found with UserId ${req.params.id}`,
      chats,
    });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Create a chat
router.post("/", async (req, res) => {
  let initialMessage = "Hey there user, feel free to ask any questions.";
  try {
    let limit = await ChatModel.find({ user: req.body.userId })
      .populate("user")
      .exec();
    if (limit.length >= 3) {
      let error = Error("Maximum chats limit has reached");
      error.code = 403;
      throw error;
    }
    const chat = await ChatModel.create({
      user: req.body.userId,
      botMessages: [{ from: "bot", message: initialMessage }],
      userMessages: [],
    });

    res
      .status(201)
      .send({ status: 201, error: false, message: "chat created", chat });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Send a message
router.post("/sendMessage", async (req, res) => {
  let { chatId, message, static } = req.body;
  try {
    const chat = await ChatModel.findById(chatId).populate("user").exec();
    if (!chat) {
      let error = Error("This chat doesn't Exist");
      error.code = 404;
      throw error;
    }

    //   Interaction with bot
    let botRes = null;
    if (static) {
      botRes = { response: "hey this is my response" };
    } else {
      let reqBody = { query: message };
      const query = await fetch(process.env.chatBotURL, {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers: {
          "Content-Type": "application/json",
        },
      });
      botRes = await query.json();
    }

    chat.userMessages.push({ from: "user", message: message });
    chat.botMessages.push({ from: "bot", message: botRes?.response });
    await chat.save();

    res.status(201).send({
      status: 201,
      error: false,
      message: "Bot reply succesfull",
      chat,
    });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

//Delete a chat
router.delete("/:id", async (req, res) => {
  try {
    let chat = await ChatModel.findById(req.params.id);
    if (!chat) {
      let error = Error("chat Not Found");
      error.code = 404;
      throw error;
    }
    await ChatModel.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .send({ status: 200, error: false, message: "chat deleted" });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;
