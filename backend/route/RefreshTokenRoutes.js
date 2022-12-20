const express = require("express");
const router = express.Router();
const handleRefreshToken = require("../controller/RefreshTokenController");

router.get("/",handleRefreshToken);

module.exports = router;