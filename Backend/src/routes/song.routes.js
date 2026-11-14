const express = require("express")
const getSongsByMood = require("../controllers/song.controller")
const router = express.Router()
router.get("/",getSongsByMood)
module.exports = router