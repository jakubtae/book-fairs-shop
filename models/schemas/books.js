const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  grade: { type: Number, required: true },
  subject: { type: String, required: true },
  author_id: { type: Number, required: true },
  price: { type: mongoose.Decimal128, required: true },
  date: { type: Date, default: () => new Date(), required: true },
  sold: { type: Boolean, default: 0, required: true },
  img_id: { type: String, required: true },
});

module.exports = mongoose.model("Books", storySchema);
///creating schema of admin with uname and password
