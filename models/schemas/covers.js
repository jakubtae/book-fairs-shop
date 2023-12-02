const mongoose = require("mongoose");

const coversSchema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model("Covers", coversSchema);
///creating schema of admin with uname and password
