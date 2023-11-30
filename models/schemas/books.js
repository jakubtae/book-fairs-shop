const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: String,
  grade: Number,
  subject: String,
  who: Number,
  price: Number,
  date: Date,
  sold: { type: Boolean, default: false },
});

module.exports = mongoose.model("Books", storySchema);
///creating schema of admin with uname and password
