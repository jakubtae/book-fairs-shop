const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
const Books = require("../models/schemas/books.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
      { title: 1, Price: 1 }
    );
    res.send(listOfBooks);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.get("/:uuid/ksiazki", authenticateToken, async (req, res) => {
  res.render("main/all.ejs", { uuid: req.params.uuid });
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

router.get("/:uuid/:storyid", authenticateToken, async (req, res) => {
  const story = await Stories.findOne({ _id: req.params.storyid });
  if (story.published === true) return res.send("Story was published");
  res.send(story);
});

router.get(
  "/:uuid/:perm/:storyid/generate",
  authenticateToken,
  async (req, res) => {
    res.render("main/generate.ejs", {
      url: req.originalUrl.substring(0, req.originalUrl.length - 9),
    });
  }
);

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
