const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
const Books = require("../models/schemas/books.js");
const Subjects = require("../models/schemas/subjects.js");
const Grades = require("../models/schemas/grades.js");
const Covers = require("../models/schemas/covers.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { default: mongoose } = require("mongoose");

// * MAIN ROUTE FOR EACH CHANNEL THAT RETURNS STORIES

router.post("/:uuid/klasy", async (req, res) => {
  try {
    const listOfGrades = await Books.distinct("Grade");
    res.send(listOfGrades);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.get("/:uuid/dodaj", authenticateToken, async (req, res) => {
  try {
    const przedmioty = await Subjects.distinct("name");
    const klasy = await Grades.distinct("name");
    const jakosc = await Covers.distinct("name");
    res.render("main/dodaj.ejs", { przedmioty, klasy, jakosc });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy/:numer", async (req, res) => {
  try {
    const listOfSubjects = await Books.distinct("Subject", {
      Grade: Number(req.params.numer),
    });
    res.send({
      listOfSubjects: listOfSubjects,
      Grade: Number(req.params.numer),
    });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy/:numer/:przedmiot", async (req, res) => {
  try {
    const listOfBooks = await Books.find(
      {
        Grade: Number(req.params.numer),
        Subject: String(req.params.przedmiot),
        sold: false,
      },
      { title: 1, Price: 1, _id: 1 }
    );
    res.send(listOfBooks);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy/:numer/:przedmiot/:podr", async (req, res) => {
  try {
    var id = new mongoose.Types.ObjectId(req.params.podr);
    const BookInfo = await Books.find({
      _id: id,
      Grade: Number(req.params.numer),
      Subject: String(req.params.przedmiot),
      sold: false,
    });
    res.send(BookInfo);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.get("/:uuid/ksiazki", authenticateToken, async (req, res) => {
  res.render("main/all.ejs", {
    uuid: req.params.uuid,
    url: req.protocol + "://" + req.get("host"),
  });
});

// * STORY IDEA CREATION ROUTE FOR EACH CHANNEL
router.post("/:uuid/new", authenticateToken, async (req, res) => {
  var now = new Date();
  const date = now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
  const stories = await Books.create({
    perm: req.params.perm,
    title: req.body.title,
    date: date,
  });
  res.send("story created successfully");
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var dir = "videos/" + req.params.storyid;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, req.params.filename + path.extname(file.originalname));
  },
});

const mainUpload = multer({ storage: storage });

router.post(
  "/:uuid/:perm/:storyid/prepare/:filename",
  authenticateToken,
  mainUpload.single("file"),
  async (req, res) => {
    var filename = req.params.filename;
    res.send({ filename: true });
  }
);

function authenticateToken(req, res, next) {
  const token = req.body.jwt || req.cookies.jwt;
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, admin) => {
    if (err) return res.sendStatus(403);
    req.admin = admin;
    if (req.params.uuid !== admin._id)
      return res.send("How the hell are you here?");
    next();
  });
}

module.exports = router;
