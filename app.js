const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const uniqueValidator = require("mongoose-unique-validator");
const moment = require("moment");

// const ObjectId = require("mongodb").ObjectId

const app = express();
const PORT = 8181;

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

try {
  mongoose.connect("mongodb://0.0.0.0:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  // console.log("S")
} catch (error) {
  console.log("Error");
}

const adtechSchema = new mongoose.Schema({
  newspaper_date: { type: String, required: true },
  article_type: { type: String, required: true },
  article_headline: { type: String, required: true },
  article_url: { type: String, required: true },
  article_content: { type: String, required: true },
  importance: { type: String, required: true },
  createdate: { type: String, required: true },
  created_by: { type: String, required: true },
  modified_by: { type: String, required: false },
  modified_date: { type: String, required: false },
});

const regSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

regSchema.plugin(uniqueValidator);
// const regSchema = {
//     username: String,
//     mobile: String,
//     email: String,
//     password: String
// }
const regModel = mongoose.model("registration", regSchema);
const adtechModel = mongoose.model("ad-Tech", adtechSchema); //new collection created

// get data for adTech
app.get("/getadtech", (req, res) => {
  adtechModel
    .find()
    .then((response) => {
      if (response == null) {
        res.send("Data not found!");
      } else {
        res.send(response);
      }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to get data!");
    });
});

//post for adtech
app.post("/addata", (req, res) => {
  try {
    const data = new adtechModel({
      newspaper_date: moment(req.body.newspaper_date).format("D-MMM-YYYY"),
      article_type: req.body.article_type,
      article_headline: req.body.article_headline,
      article_url: req.body.article_url,
      article_content: req.body.article_content,
      importance: req.body.importance,
      createdate: moment(req.body.createdate).format("D-MMM-YYYY"),
      created_by: req.body.created_by,
    });

    const value = data.save();
    if (value) {
      res.status(201).send("Posted");
    }
  } catch (error) {
    res.send("Error");
    // console.error("Error : ", error);
  }
});

// get adtech by id
app.get("/getadtech/:id", (req, res) => {
  let fetchId = req.params.id;

  adtechModel
    .findById(fetchId)
    .then((response) => {
      if (response == null) {
        res.send("Data not found!");
      } else {
        let resObj = {
          _id: response._id,
          newspaper_date: response.newspaper_date,
          article_type: response.article_type,
          article_headline: response.article_headline,
          article_url: response.article_url,
          article_content: response.article_content,
          importance: response.importance,
          createdate: moment(response.createdate).format("D-MMM-YYYY"),
          created_by: response.created_by,
          modified_date: response.modified_date,
          modified_by: response.modified_by,
        };
        res.status(200).json(resObj);
      }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to get data!");
    });
});

// update adtech by Importance
app.put("/update/:id", (req, res) => {
  let updID = req.params.id;

  let obj = {
    importance: req.body.importance,
    modified_by: req.body.modified_by,
    modified_date: Date.now(),
  };

  adtechModel
    .findByIdAndUpdate({ _id: updID }, { $set: obj }, { new: true })
    .then((response) => {
      if (response == null) {
        res.send("Data not found!");
      } else {
        res.status(200).send(response);
      }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to update data!");
    });
});

// from date , to date filter
app.get("/datefilter", (req, res) => {
  let fDate = new Date(req.query.fromDate);
  let tDate = new Date(req.query.toDate);
  let todate = new Date(tDate.setDate(tDate.getDate() + 1));

  console.log("fromDate => ", fDate);
  console.log("final toDate => ", todate);
  
  adtechModel
    .aggregate([
      {
        $match: {
          createdate: {
            $gte: fDate,
            $lt: todate,
          },
        },
      },
    ])
    .then((response) => {
      // console.log("re ",response)
      if (!response) {
        res.send("Data not found!");
      } else {
        res.status(200).send(response);
      }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to get data");
    });
});

//   get user by id
app.get("/user/:id", (req, res) => {
  let fetchId = req.params.id;
  // console.log("Id ",fetchId)

  regModel
    .findById(req.params.id)
    .then((response) => {
      if (response == null) {
        res.send("Data not found!");
      } else {
        const obj = {
          userId: response._id,
          email: response.email,
          username: response.username,
        };

        res.send(obj);
      }
    })
    .catch((err) => {
      console.log(err);
      res.send("Failed to get data!");
    });
});

// app.get("/user",(req,res)=>{
//     regModel.find().then((response)=>{

//         if(response == null){
//             res.send("Data not found!")
//         }
//         else{
//             res.send(response)
//         }
//     }).catch((err)=>{
//         res.send("Failed to get data!")
//     })
// })

// User Registration
app.post("/signup", async (req, res) => {
  const regData = new regModel({
    username: req.body.username.trim(),
    mobile: req.body.mobile.trim(),
    email: req.body.email.trim(),
    password: req.body.password.trim(),
  });

  try {
    const respo = await regData.save().then((data) => {
      console.log("data saved.");

      return res.status(200).json({ message: "User registered successfully!" });
      console.log("Hello after send");
    });
  } catch (err) {
    console.log("err", err);
    return res.status(400).json({ message: err.message });
  }
});

//Handling user login
app.post("/login", async function (req, res) {
  try {
    // check if the user exists
    const user = await regModel.findOne({ email: req.body.email.trim() });
    if (user) {
      //check if password matches
      const result = req.body.password === user.password;
      if (result) {
        return res
          .status(200)
          .json({
            login: true,
            username: user.username,
            userId: user._id,
            message: "User logged in successfully!",
          });
      } else {
        return res
          .status(400)
          .json({ login: false, error: "password doesn't match" });
      }
    } else {
      return res
        .status(400)
        .json({ login: false, error: "User doesn't exist" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

// let myDate = new Date();
// console.log(myDate)
// console.log("moment",moment().format('D-MMM-YYYY'))

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
