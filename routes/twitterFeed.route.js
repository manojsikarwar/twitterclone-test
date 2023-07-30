let express = require("express");
let router = express.Router();
let controller = require("../controller/twitterFeed.controller");
let { verifyToken } = require("../middleware/authorization");
const { twitterValid, twitterFeedUpdateValid } = require("../middleware/validation");

router.post("/twitterFeed", [verifyToken], twitterValid, controller.twitterFeedCreate);
router.get("/myTwitterFeed", [verifyToken], controller.myTwitterFeed);
router.get("/twitterFeed/:public_id", [verifyToken], controller.twitterFeedDetails);
router.delete("/twitterFeed/:public_id", [verifyToken], controller.twitterFeedDelete);
router.put("/twitterFeed", [verifyToken], twitterFeedUpdateValid, controller.twitterFeedUpdate);
router.get("/twitterFeed", [verifyToken], controller.allTwitterFeed);



module.exports = router;
