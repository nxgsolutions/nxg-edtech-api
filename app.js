const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { StatusCodes } = require("http-status-codes");
const uniqueValidator = require("mongoose-unique-validator");
const moment = require("moment");

const app = express();
const PORT = 8181;

app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

try {
  mongoose.connect("mongodb://myUserAdmin:NXG%40%2323@35.237.189.119:27017/nxgdb?authMechanism=DEFAULT&authSource=admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
} catch (error) {
  console.log("Error ", error);
}

const articleSchema = new mongoose.Schema({
  newspaper_date: { type: Date, required: true },
  news_paper_name: { type: String, required: true },
  article_type: { type: String, required: true },
  article_headline: { type: String, required: true },
  article_url: { type: String, required: true },
  article_content: { type: String, required: true },
  importance: { type: String, required: true },
  createdate: { type: Date, required: true },
  created_by: { type: String, required: true },
  modified_by: { type: String, required: false },
  modified_date: { type: Date, required: false },
});

const regSchema = new mongoose.Schema({
  username: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Schema Validation
regSchema.plugin(uniqueValidator);
articleSchema.plugin(uniqueValidator);

const regModel = mongoose.model("registrations", regSchema);
const newsArticleModel = mongoose.model("news_articles", articleSchema);

// Get All News Articles
app.get("/getarticles", (req, res) => {
  if (req?.query?.fromDate && req?.query?.toDate) {

    let fDate = new Date(req.query.fromDate);
    let tDate = new Date(req.query.toDate);
    let todate = new Date(tDate.setDate(tDate.getDate() + 1));

    console.log("fromDate => ", fDate);
    console.log("final toDate => ", todate);

    newsArticleModel
      .aggregate([
        {
          $match: {
            newspaper_date: {
              $gte: fDate,
              $lt: todate,
            },
          },
        },
      ])
      .then((response) => {
        var responseObject = [];
        if (response.length == 0) {
          res.status(404).send("Data not found!");
        } else {
          response.forEach((data) => {
            let respData = {
              _id: data._id,
              newspaper_date: moment(data.newspaper_date).format("DD-MMM-YYYY"),
              news_paper_name:data.news_paper_name,
              article_type: data.article_type,
              article_headline: data.article_headline,
              article_url: data.article_url,
              article_content: data.article_content,
              importance: data.importance,
              createdate: moment(data.createdate).format("DD-MMM-YYYY"),
              created_by: data.created_by,
              modified_date: data.modified_date,
              modified_by: data.modified_by,
            };
            responseObject.push(respData);
          });
          res.status(200).json(responseObject);
        }
      })
      .catch((err) => {
        console.log("Error ", err);
        res.send("Failed to get data");
      });
  } else {

    newsArticleModel
    .find()
    .then((response) => {
      var responseObject = [];
      if (response.length == 0) {
        res.status(404).send("Data not found!");
      } else {
        response.forEach((data) => {
          let respData = {
            _id: data._id,
            newspaper_date: moment(data.newspaper_date).format("DD-MMM-YYYY"),
            news_paper_name:data.news_paper_name,
            article_type: data.article_type,
            article_headline: data.article_headline,
            article_url: data.article_url,
            article_content: data.article_content,
            importance: data.importance,
            createdate: moment(data.createdate).format("DD-MMM-YYYY"),
            created_by: data.created_by,
            modified_date: data.modified_date,
            modified_by: data.modified_by,
          };
          responseObject.push(respData);
        });
        res.status(200).json(responseObject);
      }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to get data!");
    });

  }
  
});

//Add Article
app.post("/addarticle", (req, res) => {
  try {
    const data = new newsArticleModel({
      newspaper_date: req.body.newspaper_date,
      article_type: req.body.article_type,
      article_headline: req.body.article_headline,
      article_url: req.body.article_url,
      article_content: req.body.article_content,
      importance: req.body.importance,
      createdate: req.body.createdate,
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

// Get Article By Id
app.get("/getarticle/:id", (req, res) => {
  let fetchId = req.params.id;

  newsArticleModel
    .findById(fetchId)
    .then((response) => {
      if (response == null) {
        res.send("Data not found!");
      } else {
        let resObj = {
          _id: response._id,
          newspaper_date: moment(response.newspaper_date).format("DD-MMM-YYYY"),
          news_paper_name:response.news_paper_name,
          article_type: response.article_type,
          article_headline: response.article_headline,
          article_url: response.article_url,
          article_content: response.article_content,
          importance: response.importance,
          createdate: moment(response.createdate).format("DD-MMM-YYYY"),
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

// Update News Article By Importance
app.put("/updatearticle/:id", (req, res) => {
  let updID = req.params.id;

  let obj = {
    importance: req.body.importance,
    modified_by: req.body.modified_by,
    modified_date: Date.now(),
  };

  newsArticleModel
    .findByIdAndUpdate({ _id: updID }, { $set: obj }, { new: true })
    .then((response) => {
      console.log("upd ",response)
        let respObj = {
          _id: response._id,
          newspaper_date: moment(response.newspaper_date).format("DD-MMM-YYYY"),
          news_paper_name: response.news_paper_name,
          article_type: response.article_type,
          article_headline: response.article_headline,
          article_url: response.article_url,
          article_content: response.article_content,
          importance: response.importance,
          createdate: moment(response.createdate).format("DD-MMM-YYYY"),
          created_by: response.created_by,
          modified_date: moment(response.modified_date).format("DD-MMM-YYYY"),
          modified_by: response.modified_by,
          message:"Data Updated!"
        };
        res.status(200).json(respObj);
      // }
    })
    .catch((err) => {
      console.log("Error ", err);
      res.send("Failed to update data!");
    });
});

// Get User By Id
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
        return res.status(200).json({
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

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
