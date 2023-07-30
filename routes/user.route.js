let express = require("express");
let router = express.Router();
let controller = require("../controller/user.controller");
let { verifyToken } = require("../middleware/authorization");
// let cron = require("node-cron");
const { signupValid, loginValid } = require("../middleware/validation");

router.post("/user", signupValid, controller.create);
router.post("/login", loginValid, controller.login);
router.get("/profile", [verifyToken], controller.profile);
router.put("/logout", [verifyToken], controller.logout);
router.get("/user", [verifyToken], controller.userList);


// Cron Job
// cron.schedule("*/5 * * * * *", controller.list);
module.exports = router;
