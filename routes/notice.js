var express = require("express");
var router = express.Router();
const controllers = require("../controllers");

router.get("/detail", controllers.notice.detail.get);

module.exports = router;
