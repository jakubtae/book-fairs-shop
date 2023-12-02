const mongoose = require("mongoose");

const subjectsSchema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model("Subjects", subjectsSchema);
///creating schema of admin with uname and password
