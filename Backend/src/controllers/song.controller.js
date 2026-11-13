const songModel = require("../models/song.model")
const storageServices = require("../services/storage.service")
const id3 = require("node-id3")
async function uploadSong(req,res)
{
    const songBuffer = req.file.buffer
    const tags = id3.read(songBuffer)
    console.log(tags)
    const songFile = await storageServices.uploadFile({
        buffer:songBuffer, filename: tags.title, folder:""
    })
    const posterFile = await storageServices.uploadFile({
        buffer:tags.image.imageBuffer
    })
    const song = await songModel.create({title:tags.title, url :songFile.url, mood})
    res.status(201).json({
        message:"Song created successfully " , song
    })
}
module.exports ={uploadSong}