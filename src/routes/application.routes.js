const express = require("express");
const { addApplication } = require("../controllers/application.controllers");
const router = express.Router();

router.post('/addApplication', addApplication);

module.exports = router;
