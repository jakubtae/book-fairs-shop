const express = require("express");
const router = express.Router();
const db = require("../models/db.js");
const jwt = require("jsonwebtoken");
const Books = require("../models/schemas/books.js");
const Users = require("../models/schemas/users.js");
const Subjects = require("../models/schemas/subjects.js");
const Grades = require("../models/schemas/grades.js");
const Covers = require("../models/schemas/covers.js");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { default: mongoose, Mongoose } = require("mongoose");

// * MAIN ROUTE FOR EACH CHANNEL THAT RETURNS STORIES

router.get("/:uuid/profile", authenticateToken, async (req, res) => {
  try {
    const BooksInfo = await Books.find({
      author_id: req.params.uuid,
      "sold.if": false,
    });

    const AuthorInfo = await Users.findOne(
      {
        _id: new mongoose.Types.ObjectId(req.params.uuid),
      },
      { imie: 1, nazwisko: 1, grade: 1, class: 1, links: 1, img_id: 1 }
    );
    const img_url = AuthorInfo.img_id;
    console.log;
    res.render("main/profil.ejs", {
      AuthorInfo: AuthorInfo,
      BooksInfo: BooksInfo,
      img_url: img_url,
      uuid: req.params.uuid,
    });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy", async (req, res) => {
  try {
    const listOfGrades = await Books.distinct("grade");
    // console.log(listOfGrades);
    res.send(listOfGrades);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy/:numer", async (req, res) => {
  try {
    const listOfSubjects = await Books.distinct("subject", {
      grade: `${req.params.numer}`,
    });
    // console.log(listOfSubjects);
    res.send({
      listOfSubjects: listOfSubjects,
      grade: Number(req.params.numer),
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
        grade: `${req.params.numer}`,
        subject: String(req.params.przedmiot),
        "sold.if": false,
      },
      { title: 1, price: 1, img_id: 1, quality: 1, author_id: 1 }
    );
    // console.log(listOfBooks);
    res.send(listOfBooks);
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post("/:uuid/klasy/:numer/:przedmiot/:podr", async (req, res) => {
  try {
    var id = new mongoose.Types.ObjectId(req.params.podr);
    const BookInfo = await Books.findOne({
      _id: id,
      grade: Number(req.params.numer),
      subject: String(req.params.przedmiot),
      "sold.if": false,
    });
    const AuthorInfo = await Users.findOne(
      {
        _id: new mongoose.Types.ObjectId(BookInfo.author_id),
      },
      { imie: 1, nazwisko: 1, img_id: 1 }
    );
    res.send({ BookInfo: BookInfo, AuthorInfo: AuthorInfo });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

router.post(
  "/:uuid/klasy/:numer/:przedmiot/:podr/rezerwuj",
  async (req, res) => {
    try {
      const updateBook = await Books.updateOne(
        { _id: new mongoose.Types.ObjectId(req.params.podr) },
        { $set: { sold: { if: true, to: req.params.uuid } } }
      );
      if (!updateBook) res.send("Error saving book");
      else res.send({ status: true });
    } catch (err) {
      console.log(err);
      res.send(err);
    }
  }
);

router.get("/:uuid/ksiazki", authenticateToken, async (req, res) => {
  try {
    var img_url = await Users.findOne(
      { _id: new mongoose.Types.ObjectId(req.params.uuid) },
      { img_id: 1 }
    );
    res.render("main/all.ejs", {
      uuid: req.params.uuid,
      url: req.protocol + "://" + req.get("host"),
      img_url: img_url.img_id,
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var dir = "public/img/uploads/" + req.params.uuid;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    var file_name = `${Date.now()}` + file.originalname.match(/\..*$/)[0];
    cb(null, file_name);
  },
});

const multi_upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      const err = new Error("Only .png, .jpg and .jpeg format allowed!");
      err.name = "ExtensionError";
      return cb(err);
    }
  },
}).array("uploadedImages", 5);

router.post("/:uuid/dodaj", authenticateToken, async (req, res) => {
  try {
    multi_upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        res
          .status(500)
          .send({
            error: { message: `Multer uploading error: ${err.message}` },
          })
          .end();
        return;
      } else if (err) {
        // An unknown error occurred when uploading.
        if (err.name == "ExtensionError") {
          res
            .status(413)
            .send({ error: { message: err.message } })
            .end();
        } else {
          res
            .status(500)
            .send({
              error: { message: `unknown uploading error: ${err.message}` },
            })
            .end();
        }
        return;
      }

      var files = req.files;
      var filenames = [];
      files.forEach((file) => {
        filenames.push(file.filename);
      });

      var now = new Date();
      const date =
        now.getFullYear() + "-" + now.getMonth() + "-" + now.getDate();
      const stories = await Books.create({
        title: req.body.title,
        grade: req.body.grade,
        subject: req.body.subject,
        quality: req.body.quality,
        author_id: req.params.uuid,
        price: req.body.price,
        date: date,
        "sold.if": false,
        img_id: filenames,
      });
      // Everything went fine.
      // show file `req.files`
      // show body `req.body`
      res.status(200).end("Your files uploaded.");
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.get("/:uuid/dodaj", authenticateToken, async (req, res) => {
  try {
    const przedmioty = await Subjects.distinct("name");
    const klasy = await Grades.distinct("name");
    const jakosc = await Covers.distinct("name");
    var img_url = await Users.findOne(
      { _id: new mongoose.Types.ObjectId(req.params.uuid) },
      { img_id: 1 }
    );
    res.render("main/dodaj.ejs", {
      przedmioty,
      klasy,
      jakosc,
      img_url: img_url.img_id,
      uuid: req.params.uuid,
    });
  } catch (err) {
    res.send(err);
    console.error(err);
  }
});

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
