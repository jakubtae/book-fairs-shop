const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  uname: String,
  password: String,
  imie: String,
  nazwisko: String,
  grade: Number,
  class: String,
  img_id: { type: String, default: "logo.png" },
  links: Object,
});

module.exports = mongoose.model("Users", usersSchema);
///creating schema of admin with uname and password
