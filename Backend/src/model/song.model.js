const mongoose = require('mongoose')


const songSchema = new mongoose.Schema({
  trackId: { type: Number, unique: true },
  title: String,
  artist: String,
  cover: String,
  previewUrl: String,
  link: String,
  mood: { type: String, index: true }, // happy | sad | angry | surprised | neutral
})
const songModel = mongoose.model("songs" , songSchema)
module.exports = songModel 