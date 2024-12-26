const express = require("express");
const { getAllUser } = require("../controller/userController");
const router = express.Router();

router.get("/getAllUser", getAllUser);

module.exports = router;
