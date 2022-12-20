const express = require("express");
const {loggedInAuth} = require("../middleware/loggedInAuth");
const router = express.Router();
const {register, login, logout} = require("../controller/AuthController");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;