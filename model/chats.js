const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  { message: mongoose.SchemaTypes.String },
  { timestamps: true }
);
const chatSchema = new mongoose.Schema(
  {
    userMessages: { type: [messageSchema] },
    botMessages: { type: [messageSchema] },
    user: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "Users" },
  },
  { timestamps: true }
);

const chats = mongoose.model("Chats", chatSchema);

module.exports = chats;
