let express = require("express");
let app = express();
let Api = require("./routes");
let PORT = process.env.PORT || 3000;
let bodyParser = require("body-parser");
require("dotenv").config();
let cors = require("cors");

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use("/", Api);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
