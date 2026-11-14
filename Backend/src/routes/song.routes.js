const express = require("express")
const { getSongsByMood , searchSongs } = require("../controllers/song.controller");
const router = express.Router()
router.get("/",getSongsByMood)
router.get("/search", searchSongs)
module.exports = router