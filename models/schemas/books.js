const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  grade: { type: String, required: true },
  subject: { type: String, required: true },
  quality: { type: String, required: true },
  author_id: { type: String, required: true },
  price: { type: mongoose.Decimal128, required: true },
  date: { type: Date, default: () => new Date(), required: true },
  sold: {
    if: { type: Boolean, default: false, required: true },
    to: { type: String, default: null },
  },
  img_id: { type: Array, required: true },
});

module.exports = mongoose.model("Books", storySchema);
///creating schema of admin with uname and password
