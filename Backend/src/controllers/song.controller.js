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
module.exports ={getSongsByMood}