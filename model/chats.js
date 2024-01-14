const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema(
  {
    from: { type: mongoose.SchemaTypes.String, required: true },
    message: { type: mongoose.SchemaTypes.String, required: true },
  },
  { timestamps: true }
);
const chatSchema = new mongoose.Schema(
  {
    userMessages: { type: [messageSchema], required: true },
    botMessages: { type: [messageSchema], required: true },
    user: { type: mongoose.SchemaTypes.ObjectId, required: true, ref: "Users" },
  },
  { timestamps: true }
);

const chats = mongoose.model("Chats", chatSchema);

module.exports = chats;
