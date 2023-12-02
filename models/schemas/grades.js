const mongoose = require("mongoose");

const gradesSchema = new mongoose.Schema({
  name: Number,
});

module.exports = mongoose.model("Grades", gradesSchema);
///creating schema of admin with uname and password
