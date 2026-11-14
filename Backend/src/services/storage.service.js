require("dotenv").config()
const mongoose = require("mongoose")
const Song = require("./model/song.model")

const MOOD_QUERIES = {
  happy: ["happy pop hits", "feel good songs", "bollywood dance hits"],
  sad: ["sad songs", "heartbreak songs", "arijit singh sad"],
  angry: ["rock workout", "metal hits", "aggressive rap"],
  surprised: ["energetic edm", "party hits", "upbeat bollywood"],
  neutral: ["chill lofi", "acoustic chill", "relaxing instrumental"],
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function saveSongs() {

  for (const [mood, queries] of Object.entries(MOOD_QUERIES)) {
    for (const q of queries) {
      const url =
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}` +
        `&media=music&entity=song&limit=50&country=IN`

      try {
        const res = await fetch(url)
        const data = await res.json()
        const results = data.results || []
        for (const t of results) {
        if (!t.previewUrl) continue // skip songs with no preview

          await Song.updateOne(
            { trackId: t.trackId },
            {
              trackId: t.trackId,
              title: t.trackName,
              artist: t.artistName,
              cover: t.artworkUrl100
                ? t.artworkUrl100.replace("100x100", "300x300")
                : "",
              previewUrl: t.previewUrl,
              link: t.trackViewUrl,
              mood,
            },
            { upsert: true }
          )
        }
        console.log(`${mood}: saved "${q}" (${results.length} results)`)
      } catch (err) {
        console.log(`${mood}: failed "${q}" -`, err.message)
      }

      await sleep(3500) // stays under Apple's rate limit
    }
  }
  console.log("Seeding done")
  await mongoose.disconnect()
}

module.exports ={saveSongs}