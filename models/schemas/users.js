const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  uname: String,
  password: String,
  placed: Array,
  took: Array,
});

module.exports = mongoose.model("Users", usersSchema);
///creating schema of admin with uname and password
