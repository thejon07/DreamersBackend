const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require("./routes/user.routes");
const mongoose = require("mongoose")
const mongodburi = "mongodb+srv://jojosingh568:bijon123@cluster0.i5xe7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

const app = express();
const port = 4000;

mongoose.connect(mongodburi)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

require('dotenv').config();

// app.use(cors({
//   origin: process.env.CORS_ORIGIN,
//   credentials: true,
// }));
const allowedOrigins = ['http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Enable sending cookies
}));

// Body parsing middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true })); // handles form submissions

app.use(cookieParser());
app.use(express.static("public"));

// Route
app.use("/users", userRouter);

 
app.get('/', (req, res) => {
  res.send('Hello, MongoDB with Express!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
