const express = require("express");
const router = express.Router();
const {generateUploadUrl, updateMongoUrl} = require("../controller/S3Controller");
const {loggedInAuth} = require("../middleware/loggedInAuth")

router.get('/geturl', loggedInAuth ,generateUploadUrl);
router.post('/updateurl', loggedInAuth, updateMongoUrl);

module.exports = router;