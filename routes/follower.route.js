let express = require("express");
let router = express.Router();
let controller = require("../controller/follower.controller");
let { verifyToken } = require("../middleware/authorization");
const { followValid, reqAcceptValid, unFollowValid } = require("../middleware/validation");

router.post("/follow/:follow_id", [verifyToken], controller.followUser);
router.get("/followRequest", [verifyToken], controller.followRequest);
router.get("/follower", [verifyToken], followValid, controller.follower);
router.get("/following", [verifyToken], followValid, controller.following);
router.put("/requestAccept", [verifyToken], reqAcceptValid, controller.requestAccept);
router.delete("/unFollow/:follow_id", [verifyToken], unFollowValid, controller.unFollowUser);


module.exports = router;
