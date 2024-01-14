const app = require("express");
const router = app.Router();
const ChatModal = require("../model/chats");
require("dotenv").config();

// Get all chats
router.get("/", async (req, res) => {
  try {
    const chats = await ChatModal.find().populate("users").exec();
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
    const chat = await ChatModal.findById(req.params.id)
      .populate("users")
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
    const chats = await ChatModal.find({ user: req.params.id })
      .populate("users")
      .exec();
    if (!chats) {
      let error = Error("chats not found");
      error.code = 404;
      throw error;
    }
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
  const initialMessage = "Hey there user, feel free to ask any questions.";
  try {
    const chat = await ChatModal.create({
      user: req.body.userId,
      botMessages: [{ message: initialMessage }],
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
  const { chatId, message } = req.body;
  try {
    const chat = await ChatModal.findById(chatId);
    if (!chat) {
      let error = Error("This chat doesn't Exist");
      error.code = 404;
      throw error;
    }
    if (condition) {
    }
    //   Interaction with bot

    // let user = new messageSchema({ message: message });
    // chat.userMessages.push(user);
    // // let bot = new messageSchema({ message: message });
    // chat.botMessages.push(bot);
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
    const chat = await ChatModal.findById(req.params.id);
    if (!chat) {
      let error = Error("chat Not Found");
      error.code = 404;
      throw error;
    }
    await ChatModal.deleteOne({ _id: req.params.id });
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

//Update a chat
router.put("/:id", async (req, res) => {
  req.body.password = undefined;
  try {
    const chat = await ChatModal.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!chat) {
      let error = Error("chat Not Found");
      error.code = 404;
      throw error;
    }
    res
      .status(201)
      .send({ status: 201, error: false, message: "User Updated", user });
  } catch (error) {
    res.status(error.code || 500).send({
      status: error.code || 500,
      error: true,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;
