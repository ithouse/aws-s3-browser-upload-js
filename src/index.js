require('dotenv').config();

const express = require('express');
const cors = require('cors');

const s3Router = require('./s3-router');

const port = process.env.PORT;
const app = express();
const path = require("path");
const router = express.Router();

app.set("views", path.join(__dirname, "views"));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.json());
app.use(cors());

router.get("/", (req, res) => {
  res.render("index");
});

app.use("/", router);
app.use('/s3', s3Router);


app.listen(port, () => {
  console.log(`The Server is running on http://localhost:${port}`);
});
