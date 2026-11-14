const song = require("../model/song.model.js")

const MOODS = ["happy", "sad", "angry", "relaxed", "surprised","neutral"]

const getSongsByMood = async (req, res) => {
  try {
    console.log("in getSongsByMood")
    const mood = String(req.query.mood || "").toLowerCase()

    if (!MOODS.includes(mood)) {
      return res.status(400).json({ error: "Unknown mood" })
    }

    const songs = await song.aggregate([
      { $match: { mood } },
      { $sample: { size: 15 } },
      { $project: { _id: 0, __v: 0 } },
    ])

    res.json(songs)

  } catch (err) {
    console.error("getSongsByMood error:", err) // shows the real reason in the terminal
    res.status(500).json({ error: err.message })
  }
}

// stops special characters in the search text from breaking the regex
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const searchSongs = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim()

    if (q.length < 2) {
      return res.status(400).json({ error: "Type at least 2 characters" })
    }

    const regex = new RegExp(escapeRegex(q), "i") // "i" = ignore upper/lower case

    const songs = await song.find({
      blocked: { $ne: true },
      $or: [{ title: regex }, { artist: regex }],
    })
      .limit(30)
      .select("-_id -__v")
      .lean()

    res.json(songs)
  } catch (err) {
    console.error("searchSongs error:", err)
    res.status(500).json({ error: "Server error" })
  }
}
module.exports ={getSongsByMood, searchSongs}