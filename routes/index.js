let express = require("express");
let router = express.Router();
let userRouter = require("./user.route");
let twitterRouter = require("./twitterFeed.route");
let followRouter = require("./follower.route");

router.use("/userV1", userRouter);
router.use("/twitterV1", twitterRouter);
router.use("/followV1", followRouter);

module.exports = router;
